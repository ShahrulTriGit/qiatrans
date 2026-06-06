"""
QiaTrans Computer Vision Service
FastAPI + YOLOv8 for vehicle scratch detection
"""
import os
import io
import base64
import uuid
import json
import tempfile
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

app = FastAPI(
    title="QiaTrans CV Service",
    description="Vehicle scratch detection using YOLOv8",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Scratch locations for vehicle body
SCRATCH_LOCATIONS = [
    "Bumper Depan",
    "Bumper Belakang",
    "Pintu Depan Kiri",
    "Pintu Depan Kanan",
    "Pintu Belakang Kiri",
    "Pintu Belakang Kanan",
    "Kap Mesin",
    "Bagasi",
    "Fender Kiri",
    "Fender Kanan",
    "Roving Kiri",
    "Roving Kanan",
    "Spion Kiri",
    "Spion Kanan",
    "Pilar A",
    "Pilar B",
    "Pilar C",
    "Atap",
]

SEVERITY_LEVELS = ["RINGAN", "SEDANG", "BERAT"]


class DetectionRequest(BaseModel):
    image_base64: Optional[str] = None
    sensitivity: float = 0.5


class DetectionBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float
    location: str
    severity: str


class DetectionResponse(BaseModel):
    success: bool
    detections: list
    total_scratches: int
    average_confidence: float
    image_annotated_base64: Optional[str] = None
    processing_time_ms: float
    message: str


def simulate_yolo_detection(image_bytes: bytes, sensitivity: float = 0.5) -> dict:
    """
    Simulate YOLOv8 detection for scratch detection.
    In production, this would use the actual YOLOv8 model.
    """
    import random
    
    start_time = datetime.now()
    
    try:
        from PIL import Image
        img = Image.open(io.BytesIO(image_bytes))
        width, height = img.size
    except Exception:
        width, height = 640, 480
    
    # Number of detections based on image size and randomness
    num_detections = random.randint(0, max(1, int(sensitivity * 5)))
    
    detections = []
    for _ in range(num_detections):
        conf = round(random.uniform(0.45, 0.98), 2)
        if conf < sensitivity:
            continue
            
        # Random bounding box
        box_w = random.randint(int(width * 0.05), int(width * 0.25))
        box_h = random.randint(int(height * 0.05), int(height * 0.25))
        x1 = random.randint(0, max(0, width - box_w))
        y1 = random.randint(0, max(0, height - box_h))
        x2 = x1 + box_w
        y2 = y1 + box_h
        
        location = random.choice(SCRATCH_LOCATIONS)
        
        # Severity based on confidence and size
        area_ratio = (box_w * box_h) / (width * height)
        if area_ratio > 0.05 or conf > 0.85:
            severity = "BERAT"
        elif area_ratio > 0.02 or conf > 0.7:
            severity = "SEDANG"
        else:
            severity = "RINGAN"
        
        detections.append({
            "x1": float(x1),
            "y1": float(y1),
            "x2": float(x2),
            "y2": float(y2),
            "confidence": conf,
            "location": location,
            "severity": severity,
        })
    
    # Create annotated image with bounding boxes
    annotated_b64 = None
    try:
        from PIL import Image, ImageDraw, ImageFont
        
        img = Image.open(io.BytesIO(image_bytes))
        draw = ImageDraw.Draw(img)
        
        colors = {"RINGAN": "#22C55E", "SEDANG": "#F59E0B", "BERAT": "#EF4444"}
        
        for det in detections:
            color = colors.get(det["severity"], "#3B82F6")
            draw.rectangle(
                [det["x1"], det["y1"], det["x2"], det["y2"]],
                outline=color,
                width=3,
            )
            # Label
            label = f'{det["location"]} {det["confidence"]:.0%}'
            draw.rectangle(
                [det["x1"], det["y1"] - 20, det["x1"] + len(label) * 8, det["y1"]],
                fill=color,
            )
            draw.text((det["x1"] + 4, det["y1"] - 18), label, fill="white")
        
        # Save to base64
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=90)
        annotated_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    except Exception as e:
        print(f"Annotation error: {e}")
    
    processing_time = (datetime.now() - start_time).total_seconds() * 1000
    
    avg_conf = round(sum(d["confidence"] for d in detections) / max(len(detections), 1), 2) if detections else 0
    
    return {
        "success": True,
        "detections": detections,
        "total_scratches": len(detections),
        "average_confidence": avg_conf,
        "image_annotated_base64": annotated_b64,
        "processing_time_ms": round(processing_time, 1),
        "message": f"Deteksi selesai. {len(detections)} lecet ditemukan." if detections else "Deteksi selesai. Tidak ada lecet ditemukan.",
    }


@app.get("/")
async def root():
    return {
        "service": "QiaTrans CV Service",
        "version": "1.0.0",
        "model": "YOLOv8-scratch-detection",
        "status": "running",
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/detect", response_model=DetectionResponse)
async def detect_scratches(file: UploadFile = File(...), sensitivity: float = 0.5):
    """Detect scratches on vehicle body from uploaded image."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="Image too large (max 10MB)")
    
    result = simulate_yolo_detection(image_bytes, sensitivity)
    return DetectionResponse(**result)


@app.post("/detect-base64", response_model=DetectionResponse)
async def detect_scratches_base64(request: DetectionRequest):
    """Detect scratches from base64 encoded image."""
    if not request.image_base64:
        raise HTTPException(status_code=400, detail="image_base64 is required")
    
    try:
        image_bytes = base64.b64decode(request.image_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image data")
    
    result = simulate_yolo_detection(image_bytes, request.sensitivity)
    return DetectionResponse(**result)


@app.post("/preprocess")
async def preprocess_image(file: UploadFile = File(...)):
    """Preprocess image for better detection results."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    image_bytes = await file.read()
    
    try:
        from PIL import Image, ImageEnhance, ImageFilter
        import numpy as np
        
        img = Image.open(io.BytesIO(image_bytes))
        
        # Resize to max 1280px
        max_size = 1280
        if max(img.size) > max_size:
            ratio = max_size / max(img.size)
            new_size = (int(img.width * ratio), int(img.height * ratio))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        # Brightness normalization
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1.2)
        
        # Contrast enhancement
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.3)
        
        # Noise reduction
        img = img.filter(ImageFilter.MedianFilter(size=3))
        
        # Convert back to base64
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=95)
        processed_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        
        return {
            "success": True,
            "image_processed_base64": processed_b64,
            "original_size": f"{img.width}x{img.height}",
            "preprocessing_steps": [
                "resize (max 1280px)",
                "brightness normalization (1.2x)",
                "contrast enhancement (1.3x)",
                "noise reduction (median filter)",
            ],
            "message": "Image preprocessed successfully",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preprocessing error: {str(e)}")


@app.post("/compare")
async def compare_inspections(
    before_detections: list,
    after_detections: list,
):
    """
    Compare before and after inspection results.
    Identifies new scratches and condition changes.
    """
    before_locations = {d.get("location", "") for d in before_detections}
    after_locations = {d.get("location", "") for d in after_detections}
    
    new_locations = after_locations - before_locations
    existing_locations = before_locations & after_locations
    
    new_damages = [d for d in after_detections if d.get("location") in new_locations]
    existing_damages = [d for d in after_detections if d.get("location") in existing_locations]
    
    # Calculate condition change
    before_count = len(before_detections)
    after_count = len(after_detections)
    
    condition_change = "MEMBURUK" if after_count > before_count else "SAMA" if after_count == before_count else "MEMBAIK"
    
    return {
        "success": True,
        "comparison": {
            "before_count": before_count,
            "after_count": after_count,
            "new_damages_count": len(new_damages),
            "existing_damages_count": len(existing_damages),
            "condition_change": condition_change,
        },
        "new_damages": new_damages,
        "existing_damages": existing_damages,
        "message": f"Perbandingan selesai. {len(new_damages)} kerusakan baru terdeteksi.",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3030)

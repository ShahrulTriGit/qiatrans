import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyB2FyG3jmBAWuACZhs7bZ6mEMrT_su80ys',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'qiatrans-9a114.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'qiatrans-9a114',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'qiatrans-9a114.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID || '948767371762',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:948767371762:web:855fed3604f1ddea207b6b',
}

let app: FirebaseApp | undefined
let auth: Auth | undefined

export function getFirebaseApp(): FirebaseApp {
  if (!app || !getApps().length) {
    app = initializeApp(firebaseConfig)
  }
  return app
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp())
  }
  return auth
}

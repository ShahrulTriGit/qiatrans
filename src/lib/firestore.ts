import { firestore } from './firebase-admin'
import type {
  User, Vehicle, Rental, Inspection, DetectionResult,
  SUSResult, UEQResult, Notification,
} from '@/types'

type DocData = Record<string, unknown>

function docToData<T>(doc: FirebaseFirestore.DocumentSnapshot): T | null {
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() } as T
}

function docsToData<T>(snapshot: FirebaseFirestore.QuerySnapshot): T[] {
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T)
}

function buildWhereQuery(
  ref: FirebaseFirestore.CollectionReference,
  where: Record<string, unknown> | undefined,
  orderBy?: { [key: string]: 'asc' | 'desc' } | undefined
): FirebaseFirestore.Query {
  if (!where) return orderBy ? buildOrderBy(ref, orderBy) : ref

  const entries = Object.entries(where)
  let query: FirebaseFirestore.Query = ref

  const orConditions = where.OR as Array<Record<string, string>> | undefined
  if (orConditions && orConditions.length > 0) {
    // Use the first OR condition as a simple filter
    // Firestore doesn't support OR natively
    const firstOr = orConditions[0]
    const [field, value] = Object.entries(firstOr)[0]
    if (typeof value === 'string') {
      query = query.where(field, '>=', value).where(field, '<=', value + '\uf8ff')
    }
  }

  for (const [key, value] of entries) {
    if (key === 'OR') continue
    if (value === undefined || value === null) {
      query = query.where(key, '==', value)
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      const obj = value as Record<string, unknown>
      if ('in' in obj && Array.isArray(obj.in)) {
        query = query.where(key, 'in', obj.in)
      } else if ('contains' in obj && typeof obj.contains === 'string') {
        query = query.where(key, '>=', obj.contains).where(key, '<=', obj.contains + '\uf8ff')
      }
    } else {
      query = query.where(key, '==', value)
    }
  }

  return orderBy ? buildOrderBy(query, orderBy) : query
}

function buildOrderBy(
  query: FirebaseFirestore.Query,
  orderBy: { [key: string]: 'asc' | 'desc' } | undefined
): FirebaseFirestore.Query {
  if (!orderBy) return query
  const key = Object.keys(orderBy)[0]
  const dir = orderBy[key]
  return query.orderBy(key, dir as FirebaseFirestore.OrderByDirection)
}

function createDoc(data: DocData): Promise<FirebaseFirestore.DocumentReference> {
  const ref = firestore.collection(data._collection as string)
  delete data._collection
  data.createdAt = new Date().toISOString()
  data.updatedAt = new Date().toISOString()
  return ref.add(data)
}

function updateDoc(collection: string, id: string, data: DocData): Promise<void> {
  data.updatedAt = new Date().toISOString()
  return firestore.collection(collection).doc(id).update(data)
}

function deleteDoc(collection: string, id: string): Promise<void> {
  return firestore.collection(collection).doc(id).delete()
}

async function findUnique(collection: string, id: string): Promise<DocData | null> {
  const doc = await firestore.collection(collection).doc(id).get()
  return docToData(doc)
}

function createCollectionApi(collectionName: string) {
  const col = () => firestore.collection(collectionName)

  return {
    findMany: async (args?: {
      where?: Record<string, unknown>
      orderBy?: { [key: string]: 'asc' | 'desc' }
    }) => {
      let query = buildWhereQuery(col(), args?.where, args?.orderBy)
      const snapshot = await query.get()
      return docsToData(snapshot)
    },

    findUnique: async ({ where }: { where: { id: string } }) => {
      return findUnique(collectionName, where.id)
    },

    findFirst: async (args?: {
      where?: Record<string, unknown>
      orderBy?: { [key: string]: 'asc' | 'desc' }
    }) => {
      let query = buildWhereQuery(col(), args?.where, args?.orderBy)
      const snapshot = await query.limit(1).get()
      const docs = docsToData(snapshot)
      return docs[0] || null
    },

    create: async ({ data }: { data: DocData }) => {
      const docRef = await createDoc({ ...data, _collection: collectionName })
      const newDoc = await docRef.get()
      return docToData(newDoc)
    },

    update: async ({ where, data }: { where: { id: string }; data: DocData }) => {
      await updateDoc(collectionName, where.id, data)
      return findUnique(collectionName, where.id)
    },

    delete: async ({ where }: { where: { id: string } }) => {
      await deleteDoc(collectionName, where.id)
      return { id: where.id }
    },

    deleteMany: async ({ where }: { where: Record<string, unknown> }) => {
      let query = buildWhereQuery(col(), where)
      const snapshot = await query.get()
      const batch = firestore.batch()
      snapshot.docs.forEach(doc => batch.delete(doc.ref))
      await batch.commit()
      return { count: snapshot.size }
    },

    updateMany: async ({ where, data }: { where: Record<string, unknown>; data: DocData }) => {
      let query = buildWhereQuery(col(), where)
      const snapshot = await query.get()
      const batch = firestore.batch()
      data.updatedAt = new Date().toISOString()
      snapshot.docs.forEach(doc => batch.update(doc.ref, data))
      await batch.commit()
      return { count: snapshot.size }
    },

    count: async (args?: { where?: Record<string, unknown> }) => {
      let query = buildWhereQuery(col(), args?.where)
      const snapshot = await query.count().get()
      return snapshot.data().count
    },

    aggregate: async ({ _sum, where }: { _sum: { [key: string]: true }; where?: Record<string, unknown> }) => {
      let query = buildWhereQuery(col(), where)
      const snapshot = await query.get()
      const docs = snapshot.docs.map(d => d.data())
      const result: Record<string, number> = {}
      for (const field of Object.keys(_sum)) {
        result[`_sum`] = { [field]: docs.reduce((sum, d) => sum + (Number(d[field]) || 0), 0) }
      }
      return result
    },
  }
}

function getInclude(collectionName: string): Record<string, unknown> {
  const includes: Record<string, unknown> = {}
  const doc = collectionName as keyof typeof includeMap
  const map = includeMap[doc]
  if (map) {
    Object.assign(includes, map)
  }
  return includes
}

const includeMap: Record<string, Record<string, unknown>> = {}

export const db = {
  user: createCollectionApi('users'),
  vehicle: createCollectionApi('vehicles'),
  rental: createCollectionApi('rentals'),
  inspection: createCollectionApi('inspections'),
  detectionResult: createCollectionApi('detectionResults'),
  sUSResult: createCollectionApi('susResults'),
  uEQResult: createCollectionApi('ueqResults'),
  notification: createCollectionApi('notifications'),
}

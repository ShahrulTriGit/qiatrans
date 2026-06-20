import admin, { firestore } from './firebase-admin'
import type {
  User, Vehicle, Rental,
  SUSResult, UEQResult, Notification,
} from '@/types'

const BATCH_LIMIT = 500
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
  data.updatedAt = admin.firestore.FieldValue.serverTimestamp()
  return ref.add(data)
}

function updateDoc(collection: string, id: string, data: DocData) {
  data.updatedAt = admin.firestore.FieldValue.serverTimestamp()
  return firestore.collection(collection).doc(id).update(data)
}

function deleteDoc(collection: string, id: string) {
  return firestore.collection(collection).doc(id).delete()
}

async function findUnique(collection: string, id: string): Promise<DocData | null> {
  const doc = await firestore.collection(collection).doc(id).get()
  return docToData(doc)
}

async function runBatched(collectionName: string, where: Record<string, unknown>, operation: 'delete' | 'update', data?: DocData): Promise<{ count: number }> {
  let query = buildWhereQuery(firestore.collection(collectionName), where)
  const snapshot = await query.get()
  const docs = snapshot.docs
  let count = 0

  for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
    const batch = firestore.batch()
    const chunk = docs.slice(i, i + BATCH_LIMIT)
    for (const doc of chunk) {
      if (operation === 'delete') {
        batch.delete(doc.ref)
      } else if (operation === 'update' && data) {
        batch.update(doc.ref, data)
      }
    }
    await batch.commit()
    count += chunk.length
  }

  return { count }
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
      return runBatched(collectionName, where, 'delete')
    },

    updateMany: async ({ where, data }: { where: Record<string, unknown>; data: DocData }) => {
      data.updatedAt = admin.firestore.FieldValue.serverTimestamp()
      return runBatched(collectionName, where, 'update', data)
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
      const result: Record<string, Record<string, number>> = { _sum: {} }
      for (const field of Object.keys(_sum)) {
        result._sum[field] = docs.reduce((sum, d) => sum + (Number(d[field]) || 0), 0)
      }
      return result
    },
  }
}

export const db = {
  user: createCollectionApi('users'),
  vehicle: createCollectionApi('vehicles'),
  rental: createCollectionApi('rentals'),

  sUSResult: createCollectionApi('susResults'),
  uEQResult: createCollectionApi('ueqResults'),
  notification: createCollectionApi('notifications'),
}

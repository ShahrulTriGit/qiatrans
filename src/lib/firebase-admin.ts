import admin from 'firebase-admin'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

function getServiceAccount(): admin.ServiceAccount {
  const localPath = join(process.cwd(), 'serviceAccountKey.json')

  if (existsSync(localPath)) {
    const data = readFileSync(localPath, 'utf-8')
    return JSON.parse(data) as admin.ServiceAccount
  }

  return {
    type: 'service_account',
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    authUri: 'https://accounts.google.com/o/oauth2/auth',
    tokenUri: 'https://oauth2.googleapis.com/token',
    authProviderX509CertUrl: 'https://www.googleapis.com/oauth2/v1/certs',
    clientX509CertUrl: process.env.FIREBASE_CLIENT_CERT_URL,
    universeDomain: 'googleapis.com',
  } as admin.ServiceAccount
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(getServiceAccount()),
  })
}

export const firestore = admin.firestore()
export const auth = admin.auth()
export default admin

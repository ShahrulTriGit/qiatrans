import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { db } from '@/lib/firestore'
import { auth as firebaseAuth } from '@/lib/firebase-admin'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        idToken: { label: 'ID Token', type: 'text' },
      },
      async authorize(credentials) {
        if (credentials?.idToken) {
          try {
            const decoded = await firebaseAuth.verifyIdToken(credentials.idToken)
            const email = decoded.email!
            const name = decoded.name || email.split('@')[0]

            const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
            const ownerEmails = (process.env.OWNER_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
            const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
            const isSuperAdmin = superAdminEmails.includes(email.toLowerCase())
            const isOwner = !isSuperAdmin && ownerEmails.includes(email.toLowerCase())
            const isAdmin = !isSuperAdmin && !isOwner && adminEmails.includes(email.toLowerCase())
            const role = isSuperAdmin ? 'SUPER_ADMIN' : isOwner ? 'OWNER' : isAdmin ? 'ADMIN' : 'CUSTOMER'

            let userRecord = await db.user.findFirst({ where: { email } }) as Record<string, unknown> | null

            if (userRecord) {
              const u = userRecord as Record<string, unknown>
              if (u.role !== role) {
                await db.user.update({
                  where: { id: u.id as string },
                  data: { role },
                })
              }
            } else {
              userRecord = await db.user.create({
                data: {
                  nama: name,
                  email,
                  password: '',
                  role,
                  verified: true,
                  noTelepon: '',
                  alamat: '',
                  fotoProfil: null,
                  noKTP: null,
                  noSIM: null,
                  fotoKTP: null,
                  fotoSIM: null,
                },
              }) as Record<string, unknown> | null
            }

            const u = userRecord as Record<string, unknown>
            return {
              id: u.id as string,
              email: u.email as string,
              nama: u.nama as string,
              name: u.nama as string,
              role: u.role as 'CUSTOMER' | 'ADMIN' | 'OWNER' | 'SUPER_ADMIN',
            }
          } catch {
            throw new Error('Token tidak valid')
          }
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password harus diisi')
        }

        const userRecord = await db.user.findFirst({
          where: { email: credentials.email },
        }) as Record<string, unknown> | null

        if (!userRecord) {
          throw new Error('Email tidak terdaftar')
        }

        const u = userRecord as Record<string, unknown>
        const isPasswordValid = await compare(credentials.password, u.password as string)

        if (!isPasswordValid) {
          throw new Error('Password salah')
        }

        const email = (u.email as string).toLowerCase()
        const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
        const ownerEmails = (process.env.OWNER_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
        const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
        const isSuperAdmin = superAdminEmails.includes(email)
        const isOwner = !isSuperAdmin && ownerEmails.includes(email)
        const isAdmin = !isSuperAdmin && !isOwner && adminEmails.includes(email)
        const role = isSuperAdmin ? 'SUPER_ADMIN' : isOwner ? 'OWNER' : isAdmin ? 'ADMIN' : 'CUSTOMER'

        if (u.role !== role) {
          await db.user.update({
            where: { id: u.id as string },
            data: { role },
          })
        }

        return {
          id: u.id as string,
          email: u.email as string,
          nama: u.nama as string,
          name: u.nama as string,
          role: role as 'CUSTOMER' | 'ADMIN' | 'OWNER' | 'SUPER_ADMIN',
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
        token.nama = user.name ?? ''
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'CUSTOMER' | 'ADMIN' | 'OWNER' | 'SUPER_ADMIN'
        session.user.nama = token.nama as string
      }
      return session
    },
  },
}

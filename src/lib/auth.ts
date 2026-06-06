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
            const isAdmin = adminEmails.includes(email.toLowerCase())
            const role = isAdmin ? 'ADMIN' : 'CUSTOMER'

            let user = await db.user.findFirst({ where: { email } })

            if (user) {
              if (user.role !== role) {
                await db.user.update({
                  where: { id: user.id as string },
                  data: { role },
                })
              }
            } else {
              user = await db.user.create({
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
              })
            }

            return {
              id: user!.id as string,
              email: user!.email as string,
              nama: user!.nama as string,
              name: user!.nama as string,
              role: user!.role as 'CUSTOMER' | 'ADMIN',
            }
          } catch {
            throw new Error('Token tidak valid')
          }
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password harus diisi')
        }

        const user = await db.user.findFirst({
          where: { email: credentials.email },
        })

        if (!user) {
          throw new Error('Email tidak terdaftar')
        }

        const isPasswordValid = await compare(credentials.password, user.password as string)

        if (!isPasswordValid) {
          throw new Error('Password salah')
        }

        return {
          id: user.id as string,
          email: user.email as string,
          nama: user.nama as string,
          name: user.nama as string,
          role: user.role as 'CUSTOMER' | 'ADMIN',
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
        session.user.role = token.role as 'CUSTOMER' | 'ADMIN'
        session.user.nama = token.nama as string
      }
      return session
    },
  },
}

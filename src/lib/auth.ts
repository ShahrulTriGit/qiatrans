import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { compare } from 'bcryptjs'
import { db } from '@/lib/firestore'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
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
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
  ],
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const existing = await db.user.findFirst({
          where: { email: user.email! },
        })
        if (!existing) {
          await db.user.create({
            data: {
              nama: user.name!,
              email: user.email!,
              password: '',
              role: 'CUSTOMER',
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
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        if ((user as { role?: string }).role) {
          token.id = user.id
          token.role = (user as { role: string }).role
          token.nama = user.name ?? ''
        } else {
          const dbUser = await db.user.findFirst({
            where: { email: user.email! },
          })
          if (dbUser) {
            token.id = dbUser.id as string
            token.role = dbUser.role as 'CUSTOMER' | 'ADMIN'
            token.nama = dbUser.nama as string
          }
        }
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

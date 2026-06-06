import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      nama: string
      email: string
      role: 'CUSTOMER' | 'ADMIN'
    }
  }

  interface User {
    id: string
    nama: string
    email: string
    role: 'CUSTOMER' | 'ADMIN'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    nama: string
  }
}

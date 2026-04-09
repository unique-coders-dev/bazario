import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        totpCode: { label: '2FA Code', type: 'text', required: false }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email }
        })

        if (!admin || !admin.isActive) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, admin.password)

        if (!isPasswordValid) {
          return null
        }

        // If 2FA is enabled, verify TOTP code
        if (admin.twoFactorSecret) {
          if (!credentials.totpCode) {
            // Return user but indicate 2FA is required
            return {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: admin.role,
              requiresTwoFactor: true
            }
          }
          
          // Verify TOTP code
          const speakeasy = require('speakeasy')
          const verified = speakeasy.totp.verify({
            secret: admin.twoFactorSecret,
            encoding: 'base32',
            token: credentials.totpCode,
            window: 1
          })

          if (!verified) {
            return null
          }
        }

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as any).role
        token.requiresTwoFactor = (user as any).requiresTwoFactor
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role as string
        (session.user as any).requiresTwoFactor = token.requiresTwoFactor as boolean
      }
      return session
    }
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET
}
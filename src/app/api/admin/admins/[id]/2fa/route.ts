import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import speakeasy from 'speakeasy'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    if (body.enable) {
      // Generate 2FA secret
      const secret = speakeasy.generateSecret({ name: `Bazario Admin (${id})` })
      
      await prisma.admin.update({
        where: { id },
        data: { twoFactorSecret: secret.base32 }
      })

      return NextResponse.json({ 
        secret: secret.base32, 
        otpauthUrl: secret.otpauth_url 
      })
    } else {
      // Disable 2FA
      await prisma.admin.update({
        where: { id },
        data: { twoFactorSecret: null }
      })

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('2FA toggle error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import speakeasy from 'speakeasy'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {

    const { id } = await params
    const body = await request.json()

    if (body.enable) {
      // Generate 2FA secret
      const secret = speakeasy.generateSecret({ name: `Bazario Admin (${id})` })
      
      const { error } = await supabaseAdmin!.from('admins').update({ two_factor_secret: secret.base32 }).eq('id', id)
      if (error) throw error

      return NextResponse.json({ 
        secret: secret.base32, 
        otpauthUrl: secret.otpauth_url 
      })
    } else {
      // Disable 2FA
      const { error } = await supabaseAdmin!.from('admins').update({ two_factor_secret: null }).eq('id', id)
      if (error) throw error

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('2FA toggle error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
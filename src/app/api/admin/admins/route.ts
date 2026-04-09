import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function GET(request: Request) {
  try {

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const sort = searchParams.get('sort') || 'desc'

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (role) {
      where.role = role
    }

    let query = supabaseAdmin!.from('admins').select('id, email, name, role, is_active, two_factor_secret, created_at')
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    if (role) {
      query = query.eq('role', role)
    }
    
    const { data: admins } = await query.order('created_at', { ascending: sort === 'asc' })

    return NextResponse.json({ admins })
  } catch (error) {
    console.error('Admins GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {

    const body = await request.json()
    
    // Check if email already exists
    const { data: existing } = await supabaseAdmin!.from('admins').select('id').eq('email', body.email).single()
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(body.password, 10)

    const { data: admin, error } = await supabaseAdmin!
      .from('admins')
      .insert({
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: body.role || 'admin'
      })
      .select('id, email, name, role, is_active, created_at')
      .single()
    
    if (error) throw error

    return NextResponse.json({ admin })
  } catch (error) {
    console.error('Admins POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
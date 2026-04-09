import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {

    const { id } = await params
    const body = await request.json()

    const updateData: any = {
      name: body.name,
      email: body.email,
      role: body.role
    }

    // Only update password if provided
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10)
    }

    const { data: admin, error } = await supabaseAdmin!
      .from('admins')
      .update(updateData)
      .eq('id', id)
      .select('id, email, name, role, is_active, created_at')
      .single()
    
    if (error) throw error

    return NextResponse.json({ admin })
  } catch (error) {
    console.error('Admin PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {

    const { id } = await params
    const { error } = await supabaseAdmin!.from('admins').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
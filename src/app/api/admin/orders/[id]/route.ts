import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {

    const { id } = await params
    const body = await request.json()

    const { data: order, error } = await supabaseAdmin!
      .from('orders')
      .update({ status: body.status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error

    return NextResponse.json({ order })
  } catch (error: any) {
    console.error('Order PUT error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {

    const { id } = await params
    const { error } = await supabaseAdmin!.from('orders').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Order DELETE error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete order' }, { status: 500 })
  }
}
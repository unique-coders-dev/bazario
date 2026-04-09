import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {

    const { id } = await params
    const body = await request.json()

    // Map camelCase to snake_case for database
    const dbBody: any = {}
    if (body.name !== undefined) dbBody.name = body.name
    if (body.nameBn !== undefined) dbBody.name_bn = body.nameBn
    if (body.slug !== undefined) dbBody.slug = body.slug
    if (body.icon !== undefined) dbBody.icon = body.icon
    if (body.description !== undefined) dbBody.description = body.description
    if (body.isActive !== undefined) dbBody.is_active = body.isActive
    if (body.sortOrder !== undefined) dbBody.sort_order = body.sortOrder

    const { data: category, error } = await supabaseAdmin!
      .from('categories')
      .update(dbBody)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error

    // Map back to camelCase for response
    const mappedCategory = {
      ...category,
      nameBn: category?.name_bn,
      isActive: category?.is_active,
      sortOrder: category?.sort_order
    }

    return NextResponse.json({ category: mappedCategory })
  } catch (error: any) {
    console.error('Category PUT error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {

    const { id } = await params
    const { error } = await supabaseAdmin!.from('categories').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Category DELETE error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 })
  }
}
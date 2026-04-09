import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const sort = searchParams.get('sort') || 'desc'

    let query = supabaseAdmin!.from('categories').select('*')
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,name_bn.ilike.%${search}%`)
    }
    
    const { data: categories } = await query.order('created_at', { ascending: sort === 'asc' })

    // Map snake_case to camelCase for frontend
    const mappedCategories = (categories || []).map((cat: any) => ({
      ...cat,
      nameBn: cat.name_bn,
      isActive: cat.is_active,
      sortOrder: cat.sort_order
    }))

    return NextResponse.json({ categories: mappedCategories })
  } catch (error) {
    console.error('Categories GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {

    const body = await request.json()
    
    const { data: category, error } = await supabaseAdmin!
      .from('categories')
      .insert({
        name: body.name,
        name_bn: body.nameBn || null,
        slug: body.slug,
        icon: body.icon || null,
        description: body.description || null,
        is_active: body.isActive ?? true,
        sort_order: body.sortOrder ?? 0
      })
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
  } catch (error) {
    console.error('Categories POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
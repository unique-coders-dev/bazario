import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {

    const { id } = await params
    const body = await request.json()

    const discount = body.originalPrice > 0 
      ? Math.round(((body.originalPrice - body.price) / body.originalPrice) * 100) 
      : 0

    // Map camelCase to snake_case for database
    const dbBody: any = {
      name: body.name,
      price: body.price,
      discount,
      image: body.image,
      name_bn: body.nameBn || null,
      description: body.description,
      description_bn: body.descriptionBn || null,
      original_price: body.originalPrice,
      category_id: body.categoryId,
      is_active: body.isActive,
      is_featured: body.isFeatured,
      sort_order: body.sortOrder
    }
    
    const { data: product, error } = await supabaseAdmin!
      .from('products')
      .update(dbBody)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error

    // Map back to camelCase for response
    const mappedProduct = {
      ...product,
      nameBn: product?.name_bn,
      descriptionBn: product?.description_bn,
      originalPrice: product?.original_price,
      categoryId: product?.category_id,
      isActive: product?.is_active,
      isFeatured: product?.is_featured,
      sortOrder: product?.sort_order
    }

    return NextResponse.json({ product: mappedProduct })
  } catch (error: any) {
    console.error('Product PUT error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {

    const { id } = await params
    const { error } = await supabaseAdmin!.from('products').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Product DELETE error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 })
  }
}
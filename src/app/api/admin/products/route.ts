import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const sort = searchParams.get('sort') || 'desc'

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameBn: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (category) {
      where.categoryId = category
    }

    let query = supabaseAdmin!.from('products').select('*, categories(*)')
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,name_bn.ilike.%${search}%`)
    }
    if (category) {
      query = query.eq('category_id', category)
    }
    
    const { data: products } = await query.order('created_at', { ascending: sort === 'asc' })

    // Map snake_case to camelCase for frontend
    const mappedProducts = (products || []).map((prod: any) => {
      const category = prod.categories
      return {
        ...prod,
        nameBn: prod.name_bn,
        descriptionBn: prod.description_bn,
        originalPrice: prod.original_price,
        categoryId: prod.category_id,
        isActive: prod.is_active,
        isFeatured: prod.is_featured,
        sortOrder: prod.sort_order,
        category: category ? {
          id: category.id,
          name: category.name,
          nameBn: category.name_bn
        } : null
      }
    })

    return NextResponse.json({ products: mappedProducts })
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {

    const body = await request.json()
    
    const discount = body.originalPrice > 0 
      ? Math.round(((body.originalPrice - body.price) / body.originalPrice) * 100) 
      : 0

    const { data: product, error } = await supabaseAdmin!
      .from('products')
      .insert({
        name: body.name,
        name_bn: body.nameBn || null,
        description: body.description || null,
        description_bn: body.descriptionBn || null,
        price: body.price,
        original_price: body.originalPrice,
        discount,
        image: body.image,
        category_id: body.categoryId,
        is_active: body.isActive ?? true,
        is_featured: body.isFeatured || false,
        sort_order: body.sortOrder ?? 0
      })
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
  } catch (error) {
    console.error('Products POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
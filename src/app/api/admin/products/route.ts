import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: sort === 'asc' ? 'asc' : 'desc' }
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const discount = body.originalPrice > 0 
      ? Math.round(((body.originalPrice - body.price) / body.originalPrice) * 100) 
      : 0

    const product = await prisma.product.create({
      data: {
        name: body.name,
        nameBn: body.nameBn || null,
        description: body.description || null,
        descriptionBn: body.descriptionBn || null,
        price: body.price,
        originalPrice: body.originalPrice,
        discount,
        image: body.image,
        categoryId: body.categoryId,
        isFeatured: body.isFeatured || false
      }
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Products POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
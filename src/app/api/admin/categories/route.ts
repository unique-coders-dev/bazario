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
    const sort = searchParams.get('sort') || 'desc'

    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { nameBn: { contains: search, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: sort === 'asc' ? 'asc' : 'desc' }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Categories GET error:', error)
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
    
    const category = await prisma.category.create({
      data: {
        name: body.name,
        nameBn: body.nameBn || null,
        slug: body.slug,
        icon: body.icon || null,
        description: body.description || null
      }
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Categories POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
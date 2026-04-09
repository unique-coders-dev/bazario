import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { sortOrder: 'asc' }
    })

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

    const settings = await prisma.siteSettings.findFirst()

    return NextResponse.json({ products, categories, settings })
  } catch (error) {
    console.error('Public products GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
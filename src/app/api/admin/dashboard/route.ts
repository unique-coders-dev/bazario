import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: today
        }
      }
    })

    const allOrders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const stats = {
      todayOrders: todayOrders.length,
      todayRevenue: todayOrders.reduce((sum, order) => sum + Number(order.total), 0),
      pendingOrders: allOrders.filter(o => o.status === 'PENDING').length,
      confirmedOrders: allOrders.filter(o => o.status === 'CONFIRMED').length,
      deliveredOrders: allOrders.filter(o => o.status === 'DELIVERED').length,
      totalOrders: await prisma.order.count(),
      totalRevenue: (await prisma.order.findMany({ select: { total: true } })).reduce((sum, o) => sum + Number(o.total), 0)
    }

    return NextResponse.json({ stats, recentOrders: allOrders })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
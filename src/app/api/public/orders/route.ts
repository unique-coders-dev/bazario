import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerName, whatsapp, address, items, transactionId } = body

    if (!customerName || !whatsapp || !address || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get delivery fee from settings
    const settings = await prisma.siteSettings.findFirst()
    const deliveryFee = settings?.deliveryFee || 50

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const total = subtotal + deliveryFee

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: 'ORD-' + uuidv4().slice(0, 8).toUpperCase(),
        customerName,
        whatsapp,
        address,
        subtotal,
        deliveryFee,
        total,
        transactionId: transactionId || null,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
          }))
        }
      },
      include: {
        items: true
      }
    })

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Public orders POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
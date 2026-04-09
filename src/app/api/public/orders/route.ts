import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

// GET handler for order tracking
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')
    const whatsapp = searchParams.get('whatsapp')

    let order
    
    if (orderNumber) {
      // Search by order number (case-insensitive)
      const { data: foundOrder, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .ilike('order_number', orderNumber)
        .single()

      if (orderError || !foundOrder) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      order = foundOrder
    } else if (whatsapp) {
      // Search by WhatsApp number (case-insensitive)
      const { data: foundOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .ilike('whatsapp', whatsapp)
        .order('created_at', { ascending: false })

      if (ordersError || !foundOrders || foundOrders.length === 0) {
        return NextResponse.json({ error: 'No orders found for this WhatsApp number' }, { status: 404 })
      }
      
      // Get items for all orders
      const ordersWithItems = await Promise.all(
        foundOrders.map(async (o) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', o.id)
          return { ...o, items: items || [] }
        })
      )
      
      return NextResponse.json({ 
        success: true, 
        orders: ordersWithItems
      })
    } else {
      return NextResponse.json({ error: 'Order number or WhatsApp number is required' }, { status: 400 })
    }

    // Get order items for single order search
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)

    if (itemsError) throw itemsError

    return NextResponse.json({ 
      success: true, 
      order: {
        ...order,
        items: items || []
      }
    })
  } catch (error) {
    console.error('Public orders GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to calculate delivery fee based on tiers
function calculateDeliveryFee(subtotal: number, settings: any): number {
  const feeUnder200 = settings?.delivery_fee_under_200 ?? 20
  const feeUnder500 = settings?.delivery_fee_under_500 ?? 30
  const feeUnder1000 = settings?.delivery_fee_under_1000 ?? 40
  const feeAbove1000 = settings?.delivery_fee_above_1000 ?? 50

  if (subtotal < 200) return feeUnder200
  if (subtotal < 500) return feeUnder500
  if (subtotal < 1000) return feeUnder1000
  return feeAbove1000
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerName, whatsapp, address, items, transactionId } = body

    if (!customerName || !whatsapp || !address || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get settings for minimum order amount and delivery fee tiers
    const { data: settings } = await supabase.from('site_settings').select('*').limit(1).single()
    const minOrderAmount = settings?.min_order_amount ?? 100

    // Calculate subtotal
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)

    // Check minimum order amount
    if (subtotal < minOrderAmount) {
      return NextResponse.json({ 
        error: `Minimum order amount is ${minOrderAmount}tk. Please add more items to your cart.` 
      }, { status: 400 })
    }

    // Calculate delivery fee based on tiers
    const deliveryFee = calculateDeliveryFee(subtotal, settings)
    const total = subtotal + deliveryFee

    // Create order
    const orderNumber = 'ORD-' + uuidv4().slice(0, 8).toUpperCase()
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customerName,
        whatsapp,
        address,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        transaction_id: transactionId || null,
        status: 'PENDING'
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    }))

    const { data: createdItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select()

    if (itemsError) throw itemsError

    return NextResponse.json({ success: true, order: { ...order, items: createdItems } })
  } catch (error) {
    console.error('Public orders POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
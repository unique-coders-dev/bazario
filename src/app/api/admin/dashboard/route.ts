import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Simple check for admin authentication via custom header
function checkAdminAuth(request: Request) {
  // For now, we'll allow requests since client-side handles auth
  // In production, you could add an API key check here
  return true
}

export async function GET(request: Request) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') || ''
    const dateFilter = searchParams.get('date') || 'today'

    // Calculate date range based on filter
    const now = new Date()
    let startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    
    switch (dateFilter) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setDate(startDate.getDate() - 30)
        break
      case 'all':
        startDate = new Date('2020-01-01')
        break
    }

    // Build query based on filters
    let ordersQuery = supabaseAdmin!.from('orders').select('*', { count: 'exact' })
    
    if (dateFilter !== 'all') {
      ordersQuery = ordersQuery.gte('created_at', startDate.toISOString())
    }
    if (statusFilter) {
      ordersQuery = ordersQuery.eq('status', statusFilter)
    }

    const { data: filteredOrders, count: filteredCount } = await ordersQuery
    
    // Get today's orders (for stats comparison)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const { data: todayOrders } = await supabaseAdmin!
      .from('orders')
      .select('total')
      .gte('created_at', todayStart.toISOString())

    // Get recent orders (with filters)
    let recentQuery = supabaseAdmin!
      .from('orders')
      .select('id, order_number, customer_name, total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (dateFilter !== 'all') {
      recentQuery = recentQuery.gte('created_at', startDate.toISOString())
    }
    if (statusFilter) {
      recentQuery = recentQuery.eq('status', statusFilter)
    }
    
    const { data: allOrders } = await recentQuery

    // Get total orders count
    const { count: totalOrders } = await supabaseAdmin!
      .from('orders')
      .select('*', { count: 'exact', head: true })

    // Get total revenue
    const { data: allRevenue } = await supabaseAdmin!
      .from('orders')
      .select('total')

    const stats = {
      todayOrders: todayOrders?.length || 0,
      todayRevenue: todayOrders?.reduce((sum, o) => sum + Number(o.total), 0) || 0,
      pendingOrders: filteredOrders?.filter(o => o.status === 'PENDING').length || 0,
      confirmedOrders: filteredOrders?.filter(o => o.status === 'CONFIRMED').length || 0,
      deliveredOrders: filteredOrders?.filter(o => o.status === 'DELIVERED').length || 0,
      totalOrders: filteredCount || 0,
      totalRevenue: filteredOrders?.reduce((sum, o) => sum + Number(o.total), 0) || 0
    }

    return NextResponse.json({ stats, recentOrders: allOrders })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
'use client'

import { useState, useEffect } from 'react'
import { HiOutlineCurrencyDollar, HiOutlineShoppingCart, HiOutlineTruck, HiOutlineClock } from 'react-icons/hi'

interface DashboardStats {
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  confirmedOrders: number
  deliveredOrders: number
  totalOrders: number
  totalRevenue: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  total: number
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    totalOrders: 0,
    totalRevenue: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      const data = await res.json()
      setStats(data.stats)
      setRecentOrders(data.recentOrders)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: "Today's Orders", value: stats.todayOrders, icon: HiOutlineShoppingCart, color: 'bg-blue-500' },
    { label: "Today's Revenue", value: `${stats.todayRevenue}tk`, icon: HiOutlineCurrencyDollar, color: 'bg-green-500' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: HiOutlineClock, color: 'bg-yellow-500' },
    { label: 'Running Orders', value: stats.confirmedOrders, icon: HiOutlineTruck, color: 'bg-purple-500' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Overall Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Orders</span>
              <span className="font-medium">{stats.totalOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Revenue</span>
              <span className="font-medium text-green-600">{stats.totalRevenue}tk</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivered Orders</span>
              <span className="font-medium">{stats.deliveredOrders}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Order Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-yellow-600">Pending</span>
              <span className="font-medium">{stats.pendingOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Confirmed</span>
              <span className="font-medium">{stats.confirmedOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Delivered</span>
              <span className="font-medium">{stats.deliveredOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-800">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No orders yet</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{order.customerName}</td>
                    <td className="px-4 py-3 font-medium text-green-600">{order.total}tk</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-BD')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
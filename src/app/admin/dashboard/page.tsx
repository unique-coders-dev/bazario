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
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('today')

  useEffect(() => {
    fetchDashboardData()
  }, [statusFilter, dateFilter])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (dateFilter) params.append('date', dateFilter)
      
      const res = await fetch(`/api/admin/dashboard?${params.toString()}`)
      const data = await res.json()
      setStats(data.stats)
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex flex-wrap gap-3">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:border-green-500 text-sm"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:border-green-500 text-sm"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            Refresh
          </button>
        </div>
      </div>

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
    </div>
  )
}
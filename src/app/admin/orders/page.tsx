'use client'

import { useState, useEffect } from 'react'
import { HiOutlineSearch, HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'

interface OrderItem {
  id: string
  productName: string
  quantity: number
  price: number
  total: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  whatsapp: string
  address: string
  subtotal: number
  deliveryFee: number
  total: number
  transactionId: string | null
  status: string
  items: OrderItem[]
  createdAt: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editStatus, setEditStatus] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [searchQuery, statusFilter, sortOrder])

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/admin/orders?search=${searchQuery}&status=${statusFilter}&sort=${sortOrder}`)
      const data = await res.json()
      setOrders(data.orders)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return
    try {
      await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus })
      })
      setShowEditModal(false)
      fetchOrders()
    } catch (error) {
      console.error('Failed to update order:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return
    try {
      await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
      fetchOrders()
    } catch (error) {
      console.error('Failed to delete order:', error)
    }
  }

  const openViewModal = (order: Order) => {
    setSelectedOrder(order)
    setShowViewModal(true)
  }

  const openEditModal = (order: Order) => {
    setSelectedOrder(order)
    setEditStatus(order.status)
    setShowEditModal(true)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-green-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:border-green-500"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:border-green-500"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No orders found</td>
                  </tr>
                ) : (
                  orders.map((order) => (
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
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openViewModal(order)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="View">
                            <HiOutlineEye size={18} />
                          </button>
                          <button onClick={() => openEditModal(order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                            <HiOutlinePencil size={18} />
                          </button>
                          <button onClick={() => handleDelete(order.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                            <HiOutlineTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 m-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Order Number</p>
                  <p className="font-medium">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedOrder.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    selectedOrder.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p className="font-medium">{selectedOrder.customerName}</p>
                <p className="text-sm text-gray-600">{selectedOrder.whatsapp}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Delivery Address</p>
                <p className="text-sm text-gray-600">{selectedOrder.address}</p>
              </div>
              {selectedOrder.transactionId && (
                <div>
                  <p className="text-xs text-gray-500">Transaction ID</p>
                  <p className="text-sm font-mono">{selectedOrder.transactionId}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                      <span>{item.productName} x{item.quantity}</span>
                      <span className="font-medium">{item.total}tk</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{selectedOrder.subtotal}tk</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span>{selectedOrder.deliveryFee}tk</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">{selectedOrder.total}tk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 m-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Update Order Status</h2>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleStatusUpdate} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium">
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
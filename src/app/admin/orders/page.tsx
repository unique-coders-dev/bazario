'use client'

import { useState, useEffect } from 'react'
import { HiOutlineSearch, HiOutlineEye, HiOutlinePencil, HiOutlineTrash, HiOutlineDownload } from 'react-icons/hi'
import { jsPDF } from 'jspdf'

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
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [searchQuery, statusFilter, sortOrder])

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/admin/orders?search=${searchQuery}&status=${statusFilter}&sort=${sortOrder}`)
      const data = await res.json()
      
      if (data.error) {
        console.error('API error:', data.error)
        setOrders([])
      } else {
        // Map the API response to match our interface (handle snake_case from Supabase)
        const mappedOrders = (data.orders || []).map((order: any) => ({
          ...order,
          orderNumber: order.order_number || order.orderNumber,
          customerName: order.customer_name || order.customerName,
          whatsapp: order.whatsapp,
          address: order.address,
          subtotal: order.subtotal,
          deliveryFee: order.delivery_fee || order.deliveryFee,
          total: order.total,
          transactionId: order.transaction_id || order.transactionId,
          status: order.status,
          createdAt: order.created_at || order.createdAt,
          items: (order.order_items || order.items || []).map((item: any) => ({
            ...item,
            productName: item.product_name || item.productName,
            quantity: item.quantity,
            price: item.price,
            total: item.total
          }))
        }))
        setOrders(mappedOrders)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus })
      })
      if (res.ok) {
        setShowEditModal(false)
        fetchOrders()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update order')
      }
    } catch (error) {
      console.error('Failed to update order:', error)
      alert('Failed to update order')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchOrders()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete order')
      }
    } catch (error) {
      console.error('Failed to delete order:', error)
      alert('Failed to delete order')
    } finally {
      setDeleting(null)
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

  // Generate and download compact PDF invoice for packet labeling
  const downloadInvoice = (order: Order) => {
    // Use A6 size (105 x 148mm) - much smaller for printing with packets
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 120]  // Compact size - like a receipt
    })
    
    const pageWidth = 80
    const margin = 5
    let yPos = margin
    
    // Colors
    const primaryColor: [number, number, number] = [27, 94, 32]
    const textColor: [number, number, number] = [51, 51, 51]
    const grayColor: [number, number, number] = [102, 102, 102]
    
    // Header - compact
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, pageWidth, 15, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Bazario', pageWidth / 2, 8, { align: 'center' })
    
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.text('Fresh Groceries Delivered', pageWidth / 2, 12, { align: 'center' })
    
    yPos = 18
    
    // Order Number & Date
    doc.setTextColor(...textColor)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(order.orderNumber || 'N/A', pageWidth / 2, yPos, { align: 'center' })
    
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-BD', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    }) : 'N/A'
    doc.text(orderDate, pageWidth / 2, yPos + 4, { align: 'center' })
    
    yPos += 10
    
    // Divider
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 3
    
    // Customer Info
    doc.setTextColor(...textColor)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('Customer:', margin, yPos)
    doc.setFont('helvetica', 'normal')
    const customerName = (order.customerName || 'N/A').substring(0, 25)
    doc.text(customerName, margin + 22, yPos)
    yPos += 4
    
    doc.setFont('helvetica', 'bold')
    doc.text('Phone:', margin, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(order.whatsapp || 'N/A', margin + 16, yPos)
    yPos += 4
    
    // Address (truncated)
    doc.setFont('helvetica', 'bold')
    doc.text('Address:', margin, yPos)
    doc.setFont('helvetica', 'normal')
    const address = (order.address || 'N/A').substring(0, 30)
    const addressLines = doc.splitTextToSize(address, pageWidth - margin * 2 - 18)
    doc.text(addressLines[0] || '', margin + 18, yPos)
    yPos += 4
    
    // Divider
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 3
    
    // Items Header
    doc.setFillColor(245, 245, 245)
    doc.rect(margin, yPos - 2, pageWidth - margin * 2, 5, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...textColor)
    doc.text('Item', margin + 2, yPos + 1)
    doc.text('Qty', pageWidth - 25, yPos + 1, { align: 'center' })
    doc.text('Tk', pageWidth - margin - 2, yPos + 1, { align: 'right' })
    yPos += 6
    
    // Items
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    order.items.forEach((item) => {
      const itemName = (item.productName || '').substring(0, 22)
      doc.text(itemName, margin + 2, yPos)
      doc.text(String(item.quantity), pageWidth - 25, yPos, { align: 'center' })
      doc.text(`${item.total}`, pageWidth - margin - 2, yPos, { align: 'right' })
      yPos += 4
    })
    
    // Divider
    yPos += 2
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 3
    
    // Totals
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Subtotal:', margin + 25, yPos)
    doc.text(`${order.subtotal || 0}tk`, pageWidth - margin - 2, yPos, { align: 'right' })
    yPos += 4
    
    doc.text('Delivery:', margin + 25, yPos)
    doc.text(`${order.deliveryFee || 0}tk`, pageWidth - margin - 2, yPos, { align: 'right' })
    yPos += 5
    
    // Total
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.3)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 4
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryColor)
    doc.text('TOTAL:', margin + 20, yPos)
    doc.text(`${order.total || 0}tk`, pageWidth - margin - 2, yPos, { align: 'right' })
    
    // Footer
    yPos += 8
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    doc.text('TRX: ' + (order.transactionId || 'N/A').substring(0, 15), pageWidth / 2, yPos, { align: 'center' })
    yPos += 3
    doc.text('Thank you!', pageWidth / 2, yPos, { align: 'center' })
    
    // Save PDF - compact filename
    doc.save(`inv-${order.orderNumber}.pdf`)
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">WhatsApp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No orders found</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{order.orderNumber || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-600">{order.customerName || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {order.whatsapp ? (
                          <a href={`https://wa.me/${order.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                            {order.whatsapp}
                          </a>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 font-medium text-green-600">{order.total || 0}tk</td>
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
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('en-BD', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openViewModal(order)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="View">
                            <HiOutlineEye size={18} />
                          </button>
                          <button onClick={() => openEditModal(order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                            <HiOutlinePencil size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(order.id)} 
                            disabled={deleting === order.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                            title="Delete"
                          >
                            {deleting === order.id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <HiOutlineTrash size={18} />
                            )}
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
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 m-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => downloadInvoice(selectedOrder)} 
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-1 text-sm"
                  title="Download Invoice"
                >
                  <HiOutlineDownload size={18} />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
            </div>
            
            {/* Customer Information */}
            <div className="bg-green-50 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <span>👤 Customer Information</span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="font-medium text-gray-800">{selectedOrder?.customerName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Address:</span>
                  <span className="font-medium text-gray-800">{selectedOrder?.address || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">WhatsApp:</span>
                  {selectedOrder?.whatsapp ? (
                    <a href={`https://wa.me/${selectedOrder.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-medium text-green-600 hover:underline">
                      {selectedOrder.whatsapp}
                    </a>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <span>📍 Delivery Details</span>
              </h3>
              <p className="text-gray-700">{selectedOrder.address}</p>
            </div>

            {/* Payment Information */}
            <div className="bg-purple-50 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <span>💳 Payment Information</span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Order Number:</span>
                  <span className="font-medium text-gray-800">{selectedOrder?.orderNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-gray-800">{selectedOrder?.transactionId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="font-medium text-gray-800">
                    {selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('en-BD', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedOrder.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                selectedOrder.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                selectedOrder.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedOrder.status}
              </span>
            </div>

            {/* Products Ordered */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>🛒 Products Ordered</span>
              </h3>
              <div className="space-y-2">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-800">{item.productName}</span>
                        <span className="text-sm text-gray-500 ml-2">× {item.quantity}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-gray-800">{item.price}tk each</span>
                        <span className="text-sm text-green-600 ml-2">= {item.total}tk</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">No items found</div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{selectedOrder.subtotal}tk</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="font-medium">{selectedOrder.deliveryFee}tk</span>
              </div>
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span className="text-green-600">{selectedOrder.total}tk</span>
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
              <button onClick={() => setShowEditModal(false)} disabled={saving} className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleStatusUpdate} disabled={saving} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
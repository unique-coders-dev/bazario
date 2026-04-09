'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  HiOutlineHome, 
  HiOutlineCog, 
  HiOutlineCollection, 
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX
} from 'react-icons/hi'

const STORAGE_KEY = 'bzario_admin_auth'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

const menuItems = [
  { href: '/admin/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
  { href: '/admin/settings', icon: HiOutlineCog, label: 'Site Settings' },
  { href: '/admin/categories', icon: HiOutlineCollection, label: 'Categories' },
  { href: '/admin/products', icon: HiOutlineShoppingCart, label: 'Products' },
  { href: '/admin/orders', icon: HiOutlineShoppingCart, label: 'Orders' },
  { href: '/admin/admins', icon: HiOutlineUsers, label: 'Admin Users' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Check authentication status
    const authData = localStorage.getItem(STORAGE_KEY)
    
    if (pathname === '/admin/login') {
      // If already authenticated and trying to access login, redirect to dashboard
      if (authData) {
        const { timestamp } = JSON.parse(authData)
        if (Date.now() - timestamp < SESSION_DURATION) {
          router.push('/admin/dashboard')
          return
        }
      }
      setIsAuthenticated(false)
      return
    }
    
    // For other admin pages, check if authenticated
    if (!authData) {
      router.push('/admin/login')
      return
    }
    
    const { timestamp } = JSON.parse(authData)
    if (Date.now() - timestamp >= SESSION_DURATION) {
      // Session expired
      localStorage.removeItem(STORAGE_KEY)
      router.push('/admin/login')
      return
    }
    
    setIsAuthenticated(true)
  }, [pathname, router])

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Allow login page to render without authentication
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Not authenticated, don't render children
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-green-700 text-white px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-lg">Bazario Admin</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          {sidebarOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b">
          <h1 className="font-bold text-xl text-green-700">Bazario</h1>
          <p className="text-xs text-gray-500">Admin Portal</p>
        </div>
        
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-colors ${
                  isActive 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </a>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3 mb-3 px-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-700 font-bold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">Admin</p>
              <p className="text-xs text-gray-500 truncate">Static Auth</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY)
              window.location.href = '/admin/login'
            }}
            className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl w-full"
          >
            <HiOutlineLogout size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
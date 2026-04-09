'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Static admin password - valid for 24 hours after entry
const ADMIN_PASSWORD = 'BzRE#$#024'
const STORAGE_KEY = 'bzario_admin_auth'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Check if already authenticated
  useEffect(() => {
    const authData = localStorage.getItem(STORAGE_KEY)
    if (authData) {
      const { timestamp } = JSON.parse(authData)
      const elapsed = Date.now() - timestamp
      if (elapsed < SESSION_DURATION) {
        // Still valid, redirect to dashboard
        router.push('/admin/dashboard')
      } else {
        // Expired, clear storage
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate against static password
    if (password === ADMIN_PASSWORD) {
      // Store auth with timestamp
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        timestamp: Date.now(),
        authenticated: true
      }))
      router.push('/admin/dashboard')
    } else {
      setError('Invalid password')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-700">Bazario Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100"
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-green-600">Back to Website</a>
        </div>
      </div>
    </div>
  )
}
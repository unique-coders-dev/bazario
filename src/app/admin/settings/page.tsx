'use client'

import { useState, useEffect } from 'react'
import { HiOutlinePhotograph, HiOutlineSave } from 'react-icons/hi'

interface DeliveryTimeSlots {
  morning: string
  evening: string
}

interface SiteSettings {
  siteName: string
  logo: string
  themeColor: string
  heroTitle: string
  heroSubtitle: string
  heroBackgroundImage: string
  searchPlaceholder: string
  filterBackgroundImage: string
  minOrderAmount: number
  deliveryFeeUnder200: number
  deliveryFeeUnder500: number
  deliveryFeeUnder1000: number
  deliveryFeeAbove1000: number
  deliveryTimeSlots: DeliveryTimeSlots
  merchantNumber: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Bazario',
    logo: '',
    themeColor: '#1B5E20',
    heroTitle: 'Fresh Groceries Delivered',
    heroSubtitle: 'Quality products at your doorstep',
    heroBackgroundImage: '',
    searchPlaceholder: 'Search for vegetables, fish, rice...',
    filterBackgroundImage: '',
    minOrderAmount: 100,
    deliveryFeeUnder200: 20,
    deliveryFeeUnder500: 30,
    deliveryFeeUnder1000: 40,
    deliveryFeeAbove1000: 50,
    deliveryTimeSlots: { morning: '6 AM - 12 PM', evening: '4 PM - 9 PM' },
    merchantNumber: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setSettings(data.settings)
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' })
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      setMessage({ type: 'error', text: 'An error occurred while saving settings' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Site Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <HiOutlineSave size={20} />
              Save Changes
            </>
          )}
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Basic Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Theme Color</label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={settings.themeColor}
                  onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })}
                  className="w-16 h-12 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.themeColor}
                  onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo & Images */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <HiOutlinePhotograph className="text-green-600" />
            Images
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Logo URL</label>
              <input
                type="url"
                value={settings.logo}
                onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
              />
              {settings.logo && (
                <img src={settings.logo} alt="Logo preview" className="mt-2 h-16 w-auto rounded-lg" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Hero Background Image URL</label>
              <input
                type="url"
                value={settings.heroBackgroundImage}
                onChange={(e) => setSettings({ ...settings, heroBackgroundImage: e.target.value })}
                placeholder="https://example.com/hero.jpg"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
              />
              {settings.heroBackgroundImage && (
                <div className="mt-2 h-24 bg-cover bg-center rounded-lg" style={{ backgroundImage: `url(${settings.heroBackgroundImage})` }} />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Filter Section Background Image URL</label>
              <input
                type="url"
                value={settings.filterBackgroundImage || ''}
                onChange={(e) => setSettings({ ...settings, filterBackgroundImage: e.target.value })}
                placeholder="https://example.com/filter-bg.jpg"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">💳 Payment Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">bKash/Nagad Merchant Number</label>
              <input
                type="text"
                value={settings.merchantNumber}
                onChange={(e) => setSettings({ ...settings, merchantNumber: e.target.value })}
                placeholder="e.g., 01XXXXXXXXX"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">This number will be shown to customers for payment</p>
            </div>
          </div>
        </div>

        {/* Order & Delivery Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">🚚 Order & Delivery Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Minimum Order Amount (tk)</label>
              <input
                type="number"
                value={settings.minOrderAmount}
                onChange={(e) => setSettings({ ...settings, minOrderAmount: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Under 200tk (tk)</label>
                <input
                  type="number"
                  value={settings.deliveryFeeUnder200}
                  onChange={(e) => setSettings({ ...settings, deliveryFeeUnder200: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Under 500tk (tk)</label>
                <input
                  type="number"
                  value={settings.deliveryFeeUnder500}
                  onChange={(e) => setSettings({ ...settings, deliveryFeeUnder500: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Under 1000tk (tk)</label>
                <input
                  type="number"
                  value={settings.deliveryFeeUnder1000}
                  onChange={(e) => setSettings({ ...settings, deliveryFeeUnder1000: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">1000tk & above (tk)</label>
                <input
                  type="number"
                  value={settings.deliveryFeeAbove1000}
                  onChange={(e) => setSettings({ ...settings, deliveryFeeAbove1000: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Time Slots */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Delivery Time Slots</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Morning Slot</label>
              <input
                type="text"
                value={settings.deliveryTimeSlots.morning}
                onChange={(e) => setSettings({ ...settings, deliveryTimeSlots: { ...settings.deliveryTimeSlots, morning: e.target.value } })}
                placeholder="e.g., 6 AM - 12 PM"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Evening Slot</label>
              <input
                type="text"
                value={settings.deliveryTimeSlots.evening}
                onChange={(e) => setSettings({ ...settings, deliveryTimeSlots: { ...settings.deliveryTimeSlots, evening: e.target.value } })}
                placeholder="e.g., 4 PM - 9 PM"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Hero Title</label>
              <input
                type="text"
                value={settings.heroTitle}
                onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Hero Subtitle</label>
              <input
                type="text"
                value={settings.heroSubtitle}
                onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Search</h2>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Search Placeholder Text</label>
            <input
              type="text"
              value={settings.searchPlaceholder}
              onChange={(e) => setSettings({ ...settings, searchPlaceholder: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
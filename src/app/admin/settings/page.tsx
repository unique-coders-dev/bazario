'use client'

import { useState, useEffect } from 'react'
import { HiOutlinePhotograph, HiOutlineSave } from 'react-icons/hi'

interface SiteSettings {
  siteName: string
  logo: string
  themeColor: string
  heroTitle: string
  heroSubtitle: string
  heroBackgroundImage: string
  searchPlaceholder: string
  filterBackgroundImage: string
  deliveryFee: number
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
    deliveryFee: 50
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
        setMessage({ type: 'error', text: 'Failed to save settings' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
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
          <HiOutlineSave size={20} />
          {saving ? 'Saving...' : 'Save Changes'}
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
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Delivery Fee (tk)</label>
              <input
                type="number"
                value={settings.deliveryFee}
                onChange={(e) => setSettings({ ...settings, deliveryFee: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
              />
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
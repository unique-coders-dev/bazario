import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

export async function GET() {
  try {
    const { data: products } = await supabase
      .from('products')
      .select('*, categories(name, name_bn, slug)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    const { data: settings } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single()

    // Parse delivery time slots if it's a string
    let deliveryTimeSlots = { morning: '6 AM - 12 PM', evening: '4 PM - 9 PM' }
    if (settings?.delivery_time_slots) {
      if (typeof settings.delivery_time_slots === 'string') {
        try {
          deliveryTimeSlots = JSON.parse(settings.delivery_time_slots)
        } catch (e) {
          deliveryTimeSlots = { morning: '6 AM - 12 PM', evening: '4 PM - 9 PM' }
        }
      } else {
        deliveryTimeSlots = settings.delivery_time_slots
      }
    }

    // Map settings to camelCase for frontend
    const mappedSettings = {
      siteName: settings?.site_name || 'Bazario',
      logo: settings?.logo || '',
      themeColor: settings?.theme_color || '#1B5E20',
      heroTitle: settings?.hero_title || 'Fresh Groceries Delivered',
      heroSubtitle: settings?.hero_subtitle || 'Quality products at your doorstep',
      heroBackgroundImage: settings?.hero_background_image || '',
      searchPlaceholder: settings?.search_placeholder || 'Search for vegetables, fish, rice...',
      filterBackgroundImage: settings?.filter_background_image || '',
      minOrderAmount: settings?.min_order_amount ?? 100,
      deliveryFeeUnder200: settings?.delivery_fee_under_200 ?? 20,
      deliveryFeeUnder500: settings?.delivery_fee_under_500 ?? 30,
      deliveryFeeUnder1000: settings?.delivery_fee_under_1000 ?? 40,
      deliveryFeeAbove1000: settings?.delivery_fee_above_1000 ?? 50,
      deliveryTimeSlots,
      merchantNumber: settings?.merchant_number || ''
    }

    return NextResponse.json({ products, categories, settings: mappedSettings })
  } catch (error) {
    console.error('Public products GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
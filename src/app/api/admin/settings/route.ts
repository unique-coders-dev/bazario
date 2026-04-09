import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {

    let { data: settings } = await supabaseAdmin!.from('site_settings').select('*').limit(1).single()
    
    if (!settings) {
      const { data: newSettings, error } = await supabaseAdmin!.from('site_settings').insert({}).select().single()
      if (error) throw error
      settings = newSettings
    }

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

    // Map snake_case to camelCase for frontend
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
      deliveryTimeSlots
    }

    return NextResponse.json({ settings: mappedSettings })
  } catch (error: any) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {

    const body = await request.json()
    
    // Map camelCase to snake_case for database
    const dbBody: any = {}
    if (body.siteName !== undefined) dbBody.site_name = body.siteName
    if (body.logo !== undefined) dbBody.logo = body.logo
    if (body.themeColor !== undefined) dbBody.theme_color = body.themeColor
    if (body.heroTitle !== undefined) dbBody.hero_title = body.heroTitle
    if (body.heroSubtitle !== undefined) dbBody.hero_subtitle = body.heroSubtitle
    if (body.heroBackgroundImage !== undefined) dbBody.hero_background_image = body.heroBackgroundImage
    if (body.searchPlaceholder !== undefined) dbBody.search_placeholder = body.searchPlaceholder
    if (body.filterBackgroundImage !== undefined) dbBody.filter_background_image = body.filterBackgroundImage
    if (body.minOrderAmount !== undefined) dbBody.min_order_amount = body.minOrderAmount
    if (body.deliveryFeeUnder200 !== undefined) dbBody.delivery_fee_under_200 = body.deliveryFeeUnder200
    if (body.deliveryFeeUnder500 !== undefined) dbBody.delivery_fee_under_500 = body.deliveryFeeUnder500
    if (body.deliveryFeeUnder1000 !== undefined) dbBody.delivery_fee_under_1000 = body.deliveryFeeUnder1000
    if (body.deliveryFeeAbove1000 !== undefined) dbBody.delivery_fee_above_1000 = body.deliveryFeeAbove1000
    if (body.deliveryTimeSlots !== undefined) dbBody.delivery_time_slots = JSON.stringify(body.deliveryTimeSlots)
    
    let { data: existingSettings } = await supabaseAdmin!.from('site_settings').select('*').limit(1).single()
    
    let settings
    if (existingSettings) {
      const { data: updated, error } = await supabaseAdmin!.from('site_settings').update(dbBody).eq('id', existingSettings.id).select().single()
      if (error) throw error
      settings = updated
    } else {
      const { data: created, error } = await supabaseAdmin!.from('site_settings').insert(dbBody).select().single()
      if (error) throw error
      settings = created
    }

    return NextResponse.json({ settings })
  } catch (error: any) {
    console.error('Settings POST error:', error)
    return NextResponse.json({ error: error.message || 'Failed to save settings' }, { status: 500 })
  }
}
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

console.log('SUPABASE_URL:', supabaseUrl ? 'set' : 'missing')
console.log('SERVICE_KEY:', supabaseServiceKey ? 'set' : 'missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function main() {
  console.log('Seeding database...')

  // Create default admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const { data: existingAdmin } = await supabase.from('admins').select('id').eq('email', 'admin@bazario.com').single()

  if (!existingAdmin) {
    const { error: adminError } = await supabase.from('admins').insert({
      email: 'admin@bazario.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'super_admin',
      is_active: true
    })
    if (adminError) {
      console.error('Error creating admin:', adminError)
    } else {
      console.log('Created admin: admin@bazario.com')
    }
  }

  // Create default site settings
  const { data: existingSettings } = await supabase.from('site_settings').select('id').limit(1).single()

  if (!existingSettings) {
    const { error: settingsError } = await supabase.from('site_settings').insert({
      site_name: 'Bazario',
      logo: 'https://cdn-icons-png.flaticon.com/512/10437/10437361.png',
      theme_color: '#1B5E20',
      hero_title: 'Fresh Groceries Delivered',
      hero_subtitle: 'Quality products at your doorstep',
      hero_background_image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=400&fit=crop',
      search_placeholder: 'Search for vegetables, fish, rice...',
      delivery_fee: 50
    })
    if (settingsError) {
      console.error('Error creating settings:', settingsError)
    } else {
      console.log('Created site settings')
    }
  }

  // Create categories
  const categories = [
    { id: 'fish', name: 'Fish & Meat', name_bn: 'Fish & Meat', slug: 'fish', is_active: true, sort_order: 1 },
    { id: 'vegetables', name: 'Vegetables', name_bn: 'Vegetables', slug: 'vegetables', is_active: true, sort_order: 2 },
    { id: 'rice', name: 'Rice & Oil', name_bn: 'Rice & Oil', slug: 'rice', is_active: true, sort_order: 3 },
    { id: 'soap', name: 'Soap & Shampoo', name_bn: 'Soap & Shampoo', slug: 'soap', is_active: true, sort_order: 4 }
  ]

  for (const cat of categories) {
    const { data: existing } = await supabase.from('categories').select('id').eq('id', cat.id).single()
    if (!existing) {
      const { error } = await supabase.from('categories').insert(cat)
      if (error) {
        console.error(`Error creating category ${cat.id}:`, error)
      }
    }
  }
  console.log('Created categories')

  // Create sample products
  const products = [
    { id: 'prod-1', name: 'Fresh Salmon Fish', name_bn: 'Fresh Salmon Fish', description: '1kg', description_bn: '1kg', price: 850, original_price: 1000, discount: 15, image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=300&h=300&fit=crop', category_id: 'fish', is_active: true, sort_order: 1 },
    { id: 'prod-2', name: 'Chicken Breast', name_bn: 'Chicken Breast', description: '1kg', description_bn: '1kg', price: 220, original_price: 280, discount: 21, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=300&fit=crop', category_id: 'fish', is_active: true, sort_order: 2 },
    { id: 'prod-3', name: 'Potato', name_bn: 'Potato', description: '1kg', description_bn: '1kg', price: 30, original_price: 40, discount: 25, image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber75c?w=300&h=300&fit=crop', category_id: 'vegetables', is_active: true, sort_order: 1 },
    { id: 'prod-4', name: 'Tomato', name_bn: 'Tomato', description: '1kg', description_bn: '1kg', price: 40, original_price: 50, discount: 20, image: 'https://images.unsplash.com/photo-1546470427-227c7369a9b4?w=300&h=300&fit=crop', category_id: 'vegetables', is_active: true, sort_order: 2 },
    { id: 'prod-5', name: 'Basmati Rice', name_bn: 'Basmati Rice', description: '5kg', description_bn: '5kg', price: 650, original_price: 750, discount: 13, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop', category_id: 'rice', is_active: true, sort_order: 1 },
    { id: 'prod-6', name: 'Mustard Oil', name_bn: 'Mustard Oil', description: '1L', description_bn: '1L', price: 380, original_price: 420, discount: 10, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop', category_id: 'rice', is_active: true, sort_order: 2 },
    { id: 'prod-7', name: 'Soap', name_bn: 'Soap', description: '4pcs', description_bn: '4pcs', price: 60, original_price: 80, discount: 25, image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&h=300&fit=crop', category_id: 'soap', is_active: true, sort_order: 1 },
    { id: 'prod-8', name: 'Shampoo', name_bn: 'Shampoo', description: '200ml', description_bn: '200ml', price: 120, original_price: 150, discount: 20, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop', category_id: 'soap', is_active: true, sort_order: 2 }
  ]

  for (const product of products) {
    const { data: existing } = await supabase.from('products').select('id').eq('id', product.id).single()
    if (!existing) {
      const { error } = await supabase.from('products').insert(product)
      if (error) {
        console.error(`Error creating product ${product.id}:`, error)
      }
    }
  }
  console.log('Created sample products')

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0)
  })
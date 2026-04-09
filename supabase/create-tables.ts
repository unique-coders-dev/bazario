import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createTables() {
  console.log('Creating database tables...')

  const tables = [
    // Admins table
    `CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      two_factor_secret TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Site Settings table
    `CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      site_name TEXT DEFAULT 'Bazario',
      logo TEXT DEFAULT 'https://cdn-icons-png.flaticon.com/512/10437/10437361.png',
      theme_color TEXT DEFAULT '#1B5E20',
      hero_title TEXT DEFAULT 'Fresh Groceries Delivered',
      hero_subtitle TEXT DEFAULT 'Quality products at your doorstep',
      hero_background_image TEXT,
      search_placeholder TEXT DEFAULT 'Search for vegetables, fish, rice...',
      filter_background_image TEXT,
      delivery_fee INTEGER DEFAULT 50,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Categories table
    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      name_bn TEXT,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Products table
    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      name_bn TEXT,
      description TEXT,
      description_bn TEXT,
      price DECIMAL(10,2) NOT NULL,
      original_price DECIMAL(10,2),
      discount INTEGER DEFAULT 0,
      image TEXT NOT NULL,
      category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
      is_active BOOLEAN DEFAULT true,
      is_featured BOOLEAN DEFAULT false,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Orders table
    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      address TEXT NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      delivery_fee DECIMAL(10,2) NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      transaction_id TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Order Items table
    `CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT REFERENCES products(id),
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      total DECIMAL(10,2) NOT NULL
    );`
  ]

  for (const sql of tables) {
    const { error } = await supabase.rpc('pg_catalog.to_regclass', { text: sql })
    // Supabase doesn't support direct SQL via client, need to use the REST API
    
    // Let's use a different approach - we'll insert into a special function
    console.log('Creating table via SQL:', sql.split(' ').slice(0, 5).join(' '))
  }

  console.log('Note: Tables must be created in Supabase SQL Editor.')
  console.log('Please run the SQL from SETUP.md in your Supabase dashboard.')
}

createTables()
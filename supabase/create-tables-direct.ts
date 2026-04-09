import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// Use Supabase's REST API to execute SQL via the postgrest endpoint
async function executeSQL(sql: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({ query: sql })
  })
  
  if (!response.ok) {
    const error = await response.text()
    console.log('SQL execution note:', error)
  }
}

// Alternative: Use the pg library with connection string
import pkg from 'pg'
const { Client } = pkg

async function createTablesWithPg() {
  // Construct connection string from project URL
  // Format: postgres://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
  // We need to use a different approach since we don't have the DB password
  
  // Let's try using Supabase's session endpoint to get connection info
  console.log('Trying alternative approach...')
  
  // Actually, let's just create tables through the Supabase JS client 
  // by using the schema API approach
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
  
  console.log('Testing connection...')
  
  // Test if tables exist by querying
  const { data: testData, error: testError } = await supabase
    .from('admins')
    .select('id')
    .limit(1)
  
  if (testError) {
    console.log('Tables do not exist yet. Need to create them.')
    console.log('Error code:', testError.code)
    console.log('Error message:', testError.message)
  } else {
    console.log('Tables exist!')
  }
}

// Since Supabase doesn't allow direct SQL execution from client,
// let's create a simpler approach: we'll modify the create-tables.ts 
// to output the SQL that needs to be run

console.log(`
==========================================
To create tables in Supabase, you need to run the following SQL 
in your Supabase Dashboard SQL Editor:

==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  two_factor_secret TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings table
CREATE TABLE IF NOT EXISTS site_settings (
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
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
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
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
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
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
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
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL
);

==========================================
After creating tables, run: npm run db:seed
==========================================
`)

createTablesWithPg()
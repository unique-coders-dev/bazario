-- Bazario Database Schema
-- Run this SQL in your Supabase SQL Editor to create all required tables

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
  min_order_amount INTEGER DEFAULT 100,
  delivery_fee_under_200 INTEGER DEFAULT 20,
  delivery_fee_under_500 INTEGER DEFAULT 30,
  delivery_fee_under_1000 INTEGER DEFAULT 40,
  delivery_fee_above_1000 INTEGER DEFAULT 50,
  delivery_time_slots JSONB DEFAULT '{"morning": "6 AM - 12 PM", "evening": "4 PM - 9 PM"}',
  merchant_number TEXT DEFAULT ''
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

-- Enable Row Level Security (RLS) - optional, can be configured later
-- ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
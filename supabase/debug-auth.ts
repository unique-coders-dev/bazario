import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function debugAuth() {
  console.log('=== Debugging Admin Auth ===\n')
  
  // 1. Fetch admin user
  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', 'admin@bazario.com')
    .single()
  
  if (error) {
    console.error('Error fetching admin:', error)
    return
  }
  
  console.log('Admin found:', { 
    id: admin.id, 
    email: admin.email, 
    name: admin.name,
    isActive: admin.isActive,
    passwordPrefix: admin.password.substring(0, 20)
  })
  
  // 2. Test password
  const testPassword = 'admin123'
  const isValid = await bcrypt.compare(testPassword, admin.password)
  console.log('\nPassword test:', isValid ? 'VALID' : 'INVALID')
  
  // 3. Show what we're comparing
  console.log('\nExpected hash for "admin123":', (await bcrypt.hash(testPassword, 10)).substring(0, 20))
  console.log('Stored hash:               ', admin.password.substring(0, 20))
}

debugAuth()
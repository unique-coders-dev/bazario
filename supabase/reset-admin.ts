import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
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

async function resetAdminPassword() {
  console.log('Resetting admin password...')
  
  // Hash the password
  const hashedPassword = await bcrypt.hash('admin123', 10)
  console.log('New hash:', hashedPassword)
  
  // Update the admin user
  const { data, error } = await supabase
    .from('admins')
    .update({ password: hashedPassword })
    .eq('email', 'admin@bazario.com')
    .select()
  
  if (error) {
    console.error('Error updating password:', error)
    process.exit(1)
  }
  
  console.log('Admin password reset successfully!')
  console.log('Email: admin@bazario.com')
  console.log('Password: admin123')
}

resetAdminPassword()
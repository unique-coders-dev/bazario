import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { config } from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateAdmin() {
  const email = 'supper@gmail.com'
  const password = '81J$79j6*i@H'
  const hashedPassword = await bcrypt.hash(password, 10)

  console.log(`Setting administrative credentials for ${email}...`)

  // Check if user exists
  const { data: existing } = await supabase
    .from('admins')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    // Update
    const { error } = await supabase
      .from('admins')
      .update({ password: hashedPassword, name: 'Super Admin', role: 'super_admin', is_active: true })
      .eq('id', existing.id)
    
    if (error) {
      console.error('Error updating admin:', error)
    } else {
      console.log('Successfully updated existing admin password.')
    }
  } else {
    // Create
    const { error } = await supabase
      .from('admins')
      .insert({
        email,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'super_admin',
        is_active: true
      })
    
    if (error) {
      console.error('Error creating admin:', error)
    } else {
      console.log('Successfully created new admin user.')
    }
  }

  // Also clean up old default admin if desired? 
  // User didn't ask but it's cleaner. Let's just leave it for now.
}

updateAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

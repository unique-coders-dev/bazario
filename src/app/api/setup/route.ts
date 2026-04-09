import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This endpoint creates all database tables
// Run: curl -X POST http://localhost:3000/api/setup

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Missing Supabase environment variables' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const results = []

  // Try to insert into each table - if it fails because table doesn't exist, we note that
  const tables = ['admins', 'site_settings', 'categories', 'products', 'orders', 'order_items']
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1)
      if (error) {
        if (error.code === 'PGRST116') {
          // Table exists but no rows
          results.push({ table, status: 'exists', rows: 0 })
        } else if (error.code === 'PGRST205') {
          // Table doesn't exist
          results.push({ table, status: 'missing', error: 'Table not found in schema cache' })
        } else {
          results.push({ table, status: 'error', error: error.message })
        }
      } else {
        results.push({ table, status: 'exists', rows: 'unknown' })
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      results.push({ table, status: 'error', error: errorMessage })
    }
  }

  // Check if all tables exist
  const missingTables = results.filter(r => r.status === 'missing')
  
  if (missingTables.length > 0) {
    return NextResponse.json({
      status: 'tables_missing',
      message: 'Some tables are missing. Please create them in Supabase SQL Editor.',
      tables: results,
      missingTables: missingTables.map(t => t.table),
      sqlFile: 'supabase/schema.sql'
    })
  }

  return NextResponse.json({
    status: 'success',
    message: 'All tables exist',
    tables: results
  })
}

export async function GET() {
  return POST()
}
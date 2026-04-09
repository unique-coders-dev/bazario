import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let settings = await prisma.siteSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {}
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    let settings = await prisma.siteSettings.findFirst()
    
    if (settings) {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: body
      })
    } else {
      settings = await prisma.siteSettings.create({
        data: body
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Settings POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
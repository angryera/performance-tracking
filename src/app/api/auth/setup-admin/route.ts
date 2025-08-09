import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if any admin users exist
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin user already exists' },
        { status: 400 }
      )
    }

    // Create default super admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@company.com',
        firstName: 'Super',
        lastName: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
        minutes: 1000 // Give admin 1000 minutes by default
      }
    })

    // Remove password from response
    const { password, ...adminUserWithoutPassword } = adminUser

    return NextResponse.json({
      message: 'Default admin user created successfully',
      user: adminUserWithoutPassword,
      credentials: {
        email: 'admin@company.com',
        password: 'admin123'
      }
    })

  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Check if any admin users exist
    const adminCount = await prisma.user.count({
      where: {
        role: 'ADMIN'
      }
    })

    return NextResponse.json({
      hasAdmin: adminCount > 0,
      adminCount
    })

  } catch (error) {
    console.error('Error checking admin users:', error)
    return NextResponse.json(
      { error: 'Failed to check admin users' },
      { status: 500 }
    )
  }
} 
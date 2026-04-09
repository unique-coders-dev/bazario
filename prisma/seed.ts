import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create default admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@bazario.com' },
    update: {},
    create: {
      email: 'admin@bazario.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'super_admin'
    }
  })
  console.log('Created admin:', admin.email)

  // Create default site settings
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'Bazario',
      logo: 'https://cdn-icons-png.flaticon.com/512/10437/10437361.png',
      themeColor: '#1B5E20',
      heroTitle: 'Fresh Groceries Delivered',
      heroSubtitle: 'Quality products at your doorstep',
      heroBackgroundImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=400&fit=crop',
      searchPlaceholder: 'Search for vegetables, fish, rice...',
      deliveryFee: 50
    }
  })
  console.log('Created site settings')

  // Create categories
  const categories = [
    { id: 'fish', name: 'Fish & Meat', nameBn: '-mFish & Meat' },
    { id: 'vegetables', name: 'Vegetables', nameBn: 's Vegetables' },
    { id: 'rice', name: 'Rice & Oil', nameBn: ' Rice & Oil' },
    { id: 'soap', name: 'Soap & Shampu', nameBn: ' Soap & Shampu' }
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id,
        name: cat.name,
        nameBn: cat.nameBn,
        slug: cat.id,
        isActive: true
      }
    })
  }
  console.log('Created categories')

  // Create sample products
  const products = [
    { name: 'Fresh Salmon Fish', nameBn: 'm Fresh Salmon Fish', description: '1kg', descriptionBn: '1kg', price: 850, originalPrice: 1000, image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=300&h=300&fit=crop', categoryId: 'fish' },
    { name: 'Chicken Breast', nameBn: 'Chicken Breast', description: '1kg', descriptionBn: '1kg', price: 220, originalPrice: 280, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=300&fit=crop', categoryId: 'fish' },
    { name: 'Potato', nameBn: 'Potato', description: '1kg', descriptionBn: '1kg', price: 30, originalPrice: 40, image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber75c?w=300&h=300&fit=crop', categoryId: 'vegetables' },
    { name: 'Tomato', nameBn: 'Tomato', description: '1kg', descriptionBn: '1kg', price: 40, originalPrice: 50, image: 'https://images.unsplash.com/photo-1546470427-227c7369a9b4?w=300&h=300&fit=crop', categoryId: 'vegetables' },
    { name: 'Basmati Rice', nameBn: 'Basmati Rice', description: '5kg', descriptionBn: '5kg', price: 650, originalPrice: 750, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop', categoryId: 'rice' },
    { name: 'Mustard Oil', nameBn: 'Mustard Oil', description: '1L', descriptionBn: '1L', price: 380, originalPrice: 420, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop', categoryId: 'rice' },
    { name: 'Soap', nameBn: 'Soap', description: '4pcs', descriptionBn: '4pcs', price: 60, originalPrice: 80, image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&h=300&fit=crop', categoryId: 'soap' },
    { name: 'Shampoo', nameBn: 'Shampoo', description: '200ml', descriptionBn: '200ml', price: 120, originalPrice: 150, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop', categoryId: 'soap' }
  ]

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        isActive: true
      }
    })
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
    await prisma.$disconnect()
  })
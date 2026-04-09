# Bazario - Setup Guide

## Prerequisites
- Node.js 18+
- Vercel Account (for PostgreSQL database)

## Step 1: Database Setup

1. Go to [Vercel](https://vercel.com) and create a new project
2. Add a PostgreSQL database: Storage > Create Database > Postgres
3. Copy the connection string (DATABASE_URL)

## Step 2: Environment Variables

Create a `.env` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env
```

Edit `.env` and replace with your values:
- `DATABASE_URL`: Your Vercel Postgres connection string
- `NEXTAUTH_SECRET`: Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL`: `http://localhost:3000` (for development)

## Step 3: Database Migration

Push the schema to your database:
```bash
npm run db:push
```

## Step 4: Seed Initial Data

Create the default admin account and sample products:
```bash
npm run db:seed
```

**Default Admin Login:**
- Email: `admin@bazario.com`
- Password: `admin123`

## Step 5: Run the App

```bash
npm run dev
```

## Access Points

- **Customer Store:** http://localhost:3000
- **Admin Portal:** http://localhost:3000/admin/login

## Deployment to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Features Included

### Admin Portal
- Dashboard with today's orders, revenue, pending/running orders
- Site Settings (logo, theme, hero section, search placeholder)
- Category Management (create/update/delete with SVG icons)
- Product Management (add/edit/delete products)
- Order Management (change status, view details)
- Admin Users (create admins, manage roles)
- 2FA Support (Google Authenticator)

### Customer Store
- Product browsing with categories
- Search functionality
- Shopping cart with quantity controls
- Checkout with bKash/Nagad payment
- Order history with collapsible details
-- Premier Plus Pharmacy & Opticals Ltd - Full Safe Supabase Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/gkkcccycdfgyubqccinh/sql)

-- 1. PROFILES / USERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'pharmacist', 'cashier')),
  full_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  generic_name TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Drug',
  barcode TEXT DEFAULT '',
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  retail_price NUMERIC NOT NULL DEFAULT 0,
  wholesale_price NUMERIC NOT NULL DEFAULT 0,
  expiry_date TEXT DEFAULT '',
  supplier TEXT DEFAULT '',
  shelf_location TEXT DEFAULT '',
  min_stock_level INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SALES TABLE
CREATE TABLE IF NOT EXISTS public.sales (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  date TEXT NOT NULL,
  items_sold JSONB NOT NULL DEFAULT '[]'::jsonb,
  discount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'Cash',
  price_type TEXT DEFAULT 'retail',
  sold_by TEXT DEFAULT 'Counter Staff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HELD SALES TABLE
CREATE TABLE IF NOT EXISTS public.held_sales (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  discount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.held_sales ENABLE ROW LEVEL SECURITY;

-- DROP EXISTING POLICIES TO AVOID DUPLICATE ERRORS
DROP POLICY IF EXISTS "Allow all access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all access to products" ON public.products;
DROP POLICY IF EXISTS "Allow all access to sales" ON public.sales;
DROP POLICY IF EXISTS "Allow all access to held_sales" ON public.held_sales;

-- CREATE POLICIES FOR ACCESS
CREATE POLICY "Allow all access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to held_sales" ON public.held_sales FOR ALL USING (true) WITH CHECK (true);

-- CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_sales_invoice_number ON public.sales(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(date);

-- SEED INITIAL ADMIN & PHARMACIST PROFILES
INSERT INTO public.profiles (username, email, role, full_name)
VALUES 
  ('admin', 'admin@premierpharmacy.local', 'admin', 'System Administrator'),
  ('pharmacist', 'pharmacist@premierpharmacy.local', 'pharmacist', 'Chief Pharmacist')
ON CONFLICT (username) DO NOTHING;

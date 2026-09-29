-- Premier Plus Pharmacy - Safe Admin Account & Profiles Table Script
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/gkkcccycdfgyubqccinh/sql)

-- 1. CREATE PUBLIC PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'pharmacist', 'cashier')),
  full_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to profiles" ON public.profiles;
CREATE POLICY "Allow all access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- 2. SEED DEFAULT ADMIN USER IN PROFILES TABLE
INSERT INTO public.profiles (username, email, role, full_name)
VALUES 
  ('admin', 'admin@premierpharmacy.local', 'admin', 'System Administrator'),
  ('pharmacist', 'pharmacist@premierpharmacy.local', 'pharmacist', 'Chief Pharmacist')
ON CONFLICT (username) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;

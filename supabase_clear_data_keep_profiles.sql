-- Premier Plus Pharmacy - Clear Data Script (Preserving User Profiles & Accounts)
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/gkkcccycdfgyubqccinh/sql)

-- 1. Clear Sales Table
TRUNCATE TABLE public.sales;

-- 2. Clear Held Sales Table
TRUNCATE TABLE public.held_sales;

-- 3. Clear Products (Inventory) Table
TRUNCATE TABLE public.products;

-- NOTE: public.profiles and auth.users remain completely untouched!

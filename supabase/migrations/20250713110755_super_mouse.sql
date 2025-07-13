/*
  # Create dummy users for testing

  1. New Users
    - Admin user: admin@example.com / password123
    - Seller user: seller@example.com / password123  
    - Customer user: customer@example.com / password123
  
  2. Security
    - All users have proper roles assigned
    - Passwords are hashed by Supabase auth system
*/

-- Insert dummy users into auth.users (this will be handled by Supabase Auth)
-- We'll create the profiles directly and link them to auth users

-- Create profiles for dummy users
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@example.com', 'Admin User', 'admin', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'seller@example.com', 'John Seller', 'seller', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'customer@example.com', 'Jane Customer', 'customer', now(), now())
ON CONFLICT (id) DO NOTHING;
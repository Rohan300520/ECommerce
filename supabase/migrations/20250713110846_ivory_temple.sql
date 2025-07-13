/*
  # Create sample orders and order items

  1. New Data
    - Sample orders from the customer user
    - Different order statuses to demonstrate workflow
    - Order items linking to products
  
  2. Order Details
    - Realistic shipping addresses
    - Various order statuses (pending, confirmed, shipped, delivered)
    - Different order totals and quantities
*/

-- Insert sample orders
INSERT INTO orders (id, user_id, total_amount, status, shipping_address, created_at, updated_at) VALUES
  ('order-1', '33333333-3333-3333-3333-333333333333', 229.98, 'delivered', '{"name": "Jane Customer", "address": "123 Main St", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}', now() - interval '10 days', now() - interval '3 days'),
  ('order-2', '33333333-3333-3333-3333-333333333333', 159.98, 'shipped', '{"name": "Jane Customer", "address": "123 Main St", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}', now() - interval '5 days', now() - interval '1 day'),
  ('order-3', '33333333-3333-3333-3333-333333333333', 89.99, 'confirmed', '{"name": "Jane Customer", "address": "123 Main St", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}', now() - interval '2 days', now() - interval '1 day'),
  ('order-4', '33333333-3333-3333-3333-333333333333', 74.98, 'pending', '{"name": "Jane Customer", "address": "123 Main St", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}', now() - interval '1 day', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- Insert sample order items
INSERT INTO order_items (id, order_id, product_id, quantity, price, created_at) VALUES
  -- Order 1 items (delivered)
  ('item-1', 'order-1', 'prod-1', 1, 199.99, now() - interval '10 days'),
  ('item-2', 'order-1', 'prod-6', 1, 24.99, now() - interval '10 days'),
  
  -- Order 2 items (shipped)
  ('item-3', 'order-2', 'prod-8', 1, 129.99, now() - interval '5 days'),
  ('item-4', 'order-2', 'prod-12', 1, 29.99, now() - interval '5 days'),
  
  -- Order 3 items (confirmed)
  ('item-5', 'order-3', 'prod-7', 1, 89.99, now() - interval '2 days'),
  
  -- Order 4 items (pending)
  ('item-6', 'order-4', 'prod-14', 1, 49.99, now() - interval '1 day'),
  ('item-7', 'order-4', 'prod-6', 1, 24.99, now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;
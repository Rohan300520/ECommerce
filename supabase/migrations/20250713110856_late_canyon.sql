/*
  # Create sample notifications for users

  1. New Data
    - Sample notifications for different user types
    - Various notification types (info, success, warning)
    - Mix of read and unread notifications
  
  2. Notification Content
    - Order updates for customers
    - Inventory alerts for sellers
    - System notifications for admins
*/

-- Insert sample notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at) VALUES
  -- Customer notifications
  ('notif-1', '33333333-3333-3333-3333-333333333333', 'Order Shipped', 'Your order #order-2 has been shipped and is on its way!', 'success', false, now() - interval '1 day'),
  ('notif-2', '33333333-3333-3333-3333-333333333333', 'Order Confirmed', 'Your order #order-3 has been confirmed and is being prepared.', 'info', true, now() - interval '2 days'),
  ('notif-3', '33333333-3333-3333-3333-333333333333', 'Order Delivered', 'Your order #order-1 has been delivered successfully!', 'success', true, now() - interval '3 days'),
  
  -- Seller notifications
  ('notif-4', '22222222-2222-2222-2222-222222222222', 'Low Stock Alert', 'Portable Bluetooth Speaker is running low on stock (3 units remaining).', 'warning', false, now() - interval '2 hours'),
  ('notif-5', '22222222-2222-2222-2222-222222222222', 'Out of Stock', 'USB-C Hub Adapter is now out of stock. Please restock soon.', 'error', false, now() - interval '1 hour'),
  ('notif-6', '22222222-2222-2222-2222-222222222222', 'New Order', 'You have received a new order for Denim Jacket.', 'info', true, now() - interval '2 days'),
  
  -- Admin notifications
  ('notif-7', '11111111-1111-1111-1111-111111111111', 'New Seller Registration', 'A new seller has registered and is awaiting approval.', 'info', false, now() - interval '3 hours'),
  ('notif-8', '11111111-1111-1111-1111-111111111111', 'Product Pending Approval', 'New product "Gaming Headset" is pending approval.', 'warning', true, now() - interval '1 day'),
  ('notif-9', '11111111-1111-1111-1111-111111111111', 'System Update', 'Platform maintenance completed successfully.', 'success', true, now() - interval '5 days')
ON CONFLICT (id) DO NOTHING;
/*
  # Create sample product catalog

  1. New Data
    - Categories for different product types
    - 20+ sample products across various categories
    - Products assigned to the seller user
    - All products are approved for immediate visibility
  
  2. Product Details
    - Realistic names, descriptions, and prices
    - Stock quantities with some low-stock items
    - High-quality product images from Pexels
    - Varied categories: Electronics, Clothing, Home & Garden, Books, Sports
*/

-- Insert sample categories
INSERT INTO categories (id, name, slug, description, image_url, created_at) VALUES
  ('cat-1', 'Electronics', 'electronics', 'Latest gadgets and electronic devices', 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg', now()),
  ('cat-2', 'Clothing', 'clothing', 'Fashion and apparel for all occasions', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', now()),
  ('cat-3', 'Home & Garden', 'home-garden', 'Everything for your home and garden', 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg', now()),
  ('cat-4', 'Books', 'books', 'Books for learning and entertainment', 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg', now()),
  ('cat-5', 'Sports & Fitness', 'sports-fitness', 'Equipment for active lifestyle', 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg', now())
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (id, name, description, price, stock_quantity, category, image_url, seller_id, is_approved, average_rating, review_count, created_at, updated_at) VALUES
  -- Electronics
  ('prod-1', 'Wireless Bluetooth Headphones', 'Premium noise-canceling wireless headphones with 30-hour battery life. Perfect for music lovers and professionals.', 199.99, 25, 'electronics', 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.5, 128, now(), now()),
  ('prod-2', 'Smart Fitness Watch', 'Advanced fitness tracker with heart rate monitoring, GPS, and smartphone connectivity. Water-resistant design.', 299.99, 15, 'electronics', 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.3, 89, now(), now()),
  ('prod-3', 'Portable Bluetooth Speaker', 'Compact wireless speaker with powerful bass and 12-hour battery. Perfect for outdoor adventures.', 79.99, 3, 'electronics', 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.7, 156, now(), now()),
  ('prod-4', 'Wireless Charging Pad', 'Fast wireless charging station compatible with all Qi-enabled devices. Sleek and modern design.', 39.99, 50, 'electronics', 'https://images.pexels.com/photos/4219861/pexels-photo-4219861.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.2, 67, now(), now()),
  ('prod-5', 'USB-C Hub Adapter', 'Multi-port USB-C hub with HDMI, USB 3.0, and SD card slots. Essential for modern laptops.', 49.99, 0, 'electronics', 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.1, 43, now(), now()),

  -- Clothing
  ('prod-6', 'Classic Cotton T-Shirt', 'Comfortable 100% cotton t-shirt in various colors. Perfect for casual wear and layering.', 24.99, 100, 'clothing', 'https://images.pexels.com/photos/1020585/pexels-photo-1020585.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.4, 234, now(), now()),
  ('prod-7', 'Denim Jacket', 'Vintage-style denim jacket with classic fit. Made from premium denim with authentic wash.', 89.99, 20, 'clothing', 'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.6, 78, now(), now()),
  ('prod-8', 'Running Sneakers', 'Lightweight running shoes with advanced cushioning and breathable mesh upper. Perfect for daily runs.', 129.99, 35, 'clothing', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.8, 192, now(), now()),
  ('prod-9', 'Wool Winter Scarf', 'Soft merino wool scarf in elegant patterns. Keeps you warm and stylish during cold weather.', 45.99, 8, 'clothing', 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.3, 56, now(), now()),

  -- Home & Garden
  ('prod-10', 'Ceramic Plant Pot Set', 'Set of 3 modern ceramic planters with drainage holes. Perfect for indoor plants and herbs.', 34.99, 45, 'home-garden', 'https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.5, 123, now(), now()),
  ('prod-11', 'LED Desk Lamp', 'Adjustable LED desk lamp with touch controls and USB charging port. Energy-efficient and modern design.', 59.99, 30, 'home-garden', 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.4, 87, now(), now()),
  ('prod-12', 'Bamboo Cutting Board', 'Large bamboo cutting board with juice groove. Eco-friendly and naturally antimicrobial.', 29.99, 60, 'home-garden', 'https://images.pexels.com/photos/4226769/pexels-photo-4226769.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.7, 145, now(), now()),
  ('prod-13', 'Throw Pillow Set', 'Set of 2 decorative throw pillows with removable covers. Adds comfort and style to any room.', 39.99, 2, 'home-garden', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.2, 98, now(), now()),

  -- Books
  ('prod-14', 'JavaScript Programming Guide', 'Comprehensive guide to modern JavaScript development. Perfect for beginners and experienced developers.', 49.99, 75, 'books', 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.8, 267, now(), now()),
  ('prod-15', 'Mystery Novel Collection', 'Set of 3 bestselling mystery novels by acclaimed authors. Perfect for thriller enthusiasts.', 34.99, 40, 'books', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.6, 189, now(), now()),
  ('prod-16', 'Cooking Masterclass Book', 'Professional cooking techniques and recipes from world-renowned chefs. Includes step-by-step photos.', 59.99, 25, 'books', 'https://images.pexels.com/photos/1927348/pexels-photo-1927348.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.9, 156, now(), now()),

  -- Sports & Fitness
  ('prod-17', 'Yoga Mat Premium', 'Non-slip yoga mat with extra cushioning. Made from eco-friendly materials with alignment guides.', 69.99, 55, 'sports-fitness', 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.5, 178, now(), now()),
  ('prod-18', 'Resistance Bands Set', 'Complete set of resistance bands with different resistance levels. Includes door anchor and exercise guide.', 24.99, 80, 'sports-fitness', 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.3, 134, now(), now()),
  ('prod-19', 'Water Bottle Insulated', 'Stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours. Leak-proof design.', 34.99, 4, 'sports-fitness', 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.7, 223, now(), now()),
  ('prod-20', 'Adjustable Dumbbells', 'Space-saving adjustable dumbbells with quick-change weight system. Perfect for home workouts.', 199.99, 12, 'sports-fitness', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg', '22222222-2222-2222-2222-222222222222', true, 4.6, 89, now(), now())
ON CONFLICT (id) DO NOTHING;
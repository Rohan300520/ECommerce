/*
  # Create sample reviews for products

  1. New Data
    - Sample reviews from the customer user
    - Varied ratings and detailed comments
    - Reviews for different products to show rating system
  
  2. Review Content
    - Realistic review comments
    - Different rating levels (3-5 stars)
    - Helpful feedback for other customers
*/

-- Insert sample reviews
INSERT INTO reviews (id, product_id, user_id, rating, comment, created_at, updated_at) VALUES
  ('review-1', 'prod-1', '33333333-3333-3333-3333-333333333333', 5, 'Amazing sound quality! The noise cancellation works perfectly and the battery lasts all day. Highly recommended for anyone who loves music.', now() - interval '5 days', now() - interval '5 days'),
  ('review-2', 'prod-2', '33333333-3333-3333-3333-333333333333', 4, 'Great fitness watch with accurate tracking. The GPS is reliable and the heart rate monitor is spot on. Battery life could be better but overall very satisfied.', now() - interval '3 days', now() - interval '3 days'),
  ('review-3', 'prod-8', '33333333-3333-3333-3333-333333333333', 5, 'Best running shoes I''ve ever owned! Super comfortable, great support, and they look fantastic. Perfect for both casual wear and serious running.', now() - interval '1 day', now() - interval '1 day'),
  ('review-4', 'prod-14', '33333333-3333-3333-3333-333333333333', 5, 'Excellent programming book! Clear explanations, practical examples, and up-to-date with modern JavaScript. Perfect for both beginners and experienced developers.', now() - interval '7 days', now() - interval '7 days'),
  ('review-5', 'prod-16', '33333333-3333-3333-3333-333333333333', 4, 'Great cookbook with professional techniques. The photos are beautiful and the recipes are well-explained. Some ingredients are hard to find but worth the effort.', now() - interval '2 days', now() - interval '2 days')
ON CONFLICT (product_id, user_id) DO NOTHING;
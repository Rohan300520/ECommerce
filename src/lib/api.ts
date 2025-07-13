import { db } from './database';
import { Product, CartItem, Order, OrderItem, Review, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Products API
export const getProducts = async (filters?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}): Promise<Product[]> => {
  let query = `
    SELECT p.*, u.full_name as seller_name
    FROM products p
    LEFT JOIN users u ON p.seller_id = u.id
    WHERE p.is_approved = 1
  `;
  const params: any[] = [];

  if (filters?.category) {
    query += ' AND p.category = ?';
    params.push(filters.category);
  }

  if (filters?.search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters?.minPrice !== undefined) {
    query += ' AND p.price >= ?';
    params.push(filters.minPrice);
  }

  if (filters?.maxPrice !== undefined) {
    query += ' AND p.price <= ?';
    params.push(filters.maxPrice);
  }

  // Add sorting
  switch (filters?.sortBy) {
    case 'price_asc':
      query += ' ORDER BY p.price ASC';
      break;
    case 'price_desc':
      query += ' ORDER BY p.price DESC';
      break;
    case 'rating':
      query += ' ORDER BY p.average_rating DESC';
      break;
    case 'newest':
      query += ' ORDER BY p.created_at DESC';
      break;
    default:
      query += ' ORDER BY p.created_at DESC';
  }

  const products = db.prepare(query).all(...params) as any[];
  return products.map(p => ({
    ...p,
    seller: p.seller_name ? { full_name: p.seller_name } : undefined
  }));
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const product = db.prepare(`
    SELECT p.*, u.full_name as seller_name
    FROM products p
    LEFT JOIN users u ON p.seller_id = u.id
    WHERE p.id = ?
  `).get(id) as any;

  if (!product) return null;

  return {
    ...product,
    seller: product.seller_name ? { full_name: product.seller_name } : undefined
  };
};

// Cart API
export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  const items = db.prepare(`
    SELECT ci.*, p.name, p.price, p.image_url, p.stock_quantity
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `).all(userId) as any[];

  return items.map(item => ({
    ...item,
    product: {
      id: item.product_id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      stock_quantity: item.stock_quantity
    }
  }));
};

export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
  try {
    // Check if item already exists
    const existingItem = db.prepare(`
      SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?
    `).get(userId, productId) as any;

    if (existingItem) {
      // Update quantity
      db.prepare(`
        UPDATE cart_items SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND product_id = ?
      `).run(quantity, userId, productId);
    } else {
      // Add new item
      db.prepare(`
        INSERT INTO cart_items (id, user_id, product_id, quantity)
        VALUES (?, ?, ?, ?)
      `).run(uuidv4(), userId, productId, quantity);
    }
  } catch (error) {
    throw error;
  }
};

export const updateCartItemQuantity = async (itemId: string, quantity: number) => {
  if (quantity <= 0) {
    db.prepare('DELETE FROM cart_items WHERE id = ?').run(itemId);
  } else {
    db.prepare(`
      UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(quantity, itemId);
  }
};

export const removeFromCart = async (itemId: string) => {
  db.prepare('DELETE FROM cart_items WHERE id = ?').run(itemId);
};

export const clearCart = async (userId: string) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
};

// Orders API
export const getOrders = async (userId: string): Promise<Order[]> => {
  const orders = db.prepare(`
    SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
  `).all(userId) as any[];

  // Get order items for each order
  for (const order of orders) {
    const items = db.prepare(`
      SELECT oi.*, p.name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(order.id) as any[];

    order.items = items.map((item: any) => ({
      ...item,
      product: {
        id: item.product_id,
        name: item.name,
        image_url: item.image_url
      }
    }));
  }

  return orders;
};

export const createOrder = async (userId: string, items: CartItem[], shippingAddress: any) => {
  const orderId = uuidv4();
  const totalAmount = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  // Create order
  db.prepare(`
    INSERT INTO orders (id, user_id, total_amount, shipping_address)
    VALUES (?, ?, ?, ?)
  `).run(orderId, userId, totalAmount, JSON.stringify(shippingAddress));

  // Create order items
  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (id, order_id, product_id, quantity, price)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const item of items) {
    insertOrderItem.run(
      uuidv4(),
      orderId,
      item.product_id,
      item.quantity,
      item.product?.price || 0
    );

    // Update product stock
    db.prepare(`
      UPDATE products SET stock_quantity = stock_quantity - ?
      WHERE id = ?
    `).run(item.quantity, item.product_id);
  }

  // Clear cart
  await clearCart(userId);

  return orderId;
};

// Reviews API
export const getProductReviews = async (productId: string): Promise<Review[]> => {
  const reviews = db.prepare(`
    SELECT r.*, u.full_name as user_name
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
  `).all(productId) as any[];

  return reviews.map(review => ({
    ...review,
    user: { full_name: review.user_name }
  }));
};

export const createReview = async (productId: string, userId: string, rating: number, comment: string) => {
  const reviewId = uuidv4();

  db.prepare(`
    INSERT INTO reviews (id, product_id, user_id, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `).run(reviewId, productId, userId, rating, comment);

  // Update product rating
  const reviews = db.prepare(`
    SELECT AVG(rating) as avg_rating, COUNT(*) as count
    FROM reviews WHERE product_id = ?
  `).get(productId) as any;

  db.prepare(`
    UPDATE products SET average_rating = ?, review_count = ?
    WHERE id = ?
  `).run(reviews.avg_rating, reviews.count, productId);

  return reviewId;
};

// Notifications API
export const getNotifications = async (userId: string) => {
  return db.prepare(`
    SELECT * FROM notifications WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId);
};

export const markNotificationAsRead = async (notificationId: string) => {
  db.prepare(`
    UPDATE notifications SET is_read = 1 WHERE id = ?
  `).run(notificationId);
};

// Admin API
export const getAllUsers = async (): Promise<User[]> => {
  return db.prepare(`
    SELECT id, email, full_name, role, is_banned, created_at
    FROM users ORDER BY created_at DESC
  `).all() as User[];
};

export const updateUserRole = async (userId: string, role: string) => {
  db.prepare(`
    UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(role, userId);
};

export const banUser = async (userId: string, banned: boolean) => {
  db.prepare(`
    UPDATE users SET is_banned = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(banned, userId);
};

export const getAllProducts = async (): Promise<Product[]> => {
  const products = db.prepare(`
    SELECT p.*, u.full_name as seller_name
    FROM products p
    LEFT JOIN users u ON p.seller_id = u.id
    ORDER BY p.created_at DESC
  `).all() as any[];

  return products.map(p => ({
    ...p,
    seller: p.seller_name ? { full_name: p.seller_name } : undefined
  }));
};

export const approveProduct = async (productId: string, approved: boolean) => {
  db.prepare(`
    UPDATE products SET is_approved = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(approved, productId);
};
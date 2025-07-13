import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Initialize SQLite database
const dbPath = path.join(process.cwd(), 'ecommerce.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
export const initializeDatabase = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
      avatar_url TEXT,
      is_banned BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
      stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
      category TEXT NOT NULL,
      image_url TEXT,
      seller_id TEXT,
      is_approved BOOLEAN DEFAULT FALSE,
      average_rating DECIMAL(3,2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
      review_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Cart items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    )
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
      shipping_address TEXT NOT NULL,
      payment_intent_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Order items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // Reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(product_id, user_id)
    )
  `);

  // Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
      is_read BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('Database tables created successfully');
};

// Seed dummy data
export const seedDatabase = () => {
  try {
    // Clear existing data
    db.exec('DELETE FROM notifications');
    db.exec('DELETE FROM reviews');
    db.exec('DELETE FROM order_items');
    db.exec('DELETE FROM orders');
    db.exec('DELETE FROM cart_items');
    db.exec('DELETE FROM products');
    db.exec('DELETE FROM categories');
    db.exec('DELETE FROM users');

    // Create dummy users
    const users = [
      {
        id: uuidv4(),
        email: 'admin@example.com',
        password_hash: bcrypt.hashSync('password123', 10),
        full_name: 'Admin User',
        role: 'admin'
      },
      {
        id: uuidv4(),
        email: 'seller@example.com',
        password_hash: bcrypt.hashSync('password123', 10),
        full_name: 'John Seller',
        role: 'seller'
      },
      {
        id: uuidv4(),
        email: 'customer@example.com',
        password_hash: bcrypt.hashSync('password123', 10),
        full_name: 'Jane Customer',
        role: 'customer'
      }
    ];

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?, ?)
    `);

    users.forEach(user => {
      insertUser.run(user.id, user.email, user.password_hash, user.full_name, user.role);
    });

    const adminId = users[0].id;
    const sellerId = users[1].id;
    const customerId = users[2].id;

    // Create categories
    const categories = [
      { id: uuidv4(), name: 'Electronics', slug: 'electronics' },
      { id: uuidv4(), name: 'Clothing', slug: 'clothing' },
      { id: uuidv4(), name: 'Home & Garden', slug: 'home-garden' },
      { id: uuidv4(), name: 'Books', slug: 'books' },
      { id: uuidv4(), name: 'Sports & Fitness', slug: 'sports-fitness' }
    ];

    const insertCategory = db.prepare(`
      INSERT INTO categories (id, name, slug)
      VALUES (?, ?, ?)
    `);

    categories.forEach(category => {
      insertCategory.run(category.id, category.name, category.slug);
    });

    // Create sample products
    const products = [
      // Electronics
      {
        id: uuidv4(),
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
        price: 199.99,
        stock_quantity: 25,
        category: 'electronics',
        image_url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
        seller_id: sellerId,
        is_approved: true,
        average_rating: 4.5,
        review_count: 12
      },
      {
        id: uuidv4(),
        name: 'Smart Fitness Watch',
        description: 'Track your fitness goals with this advanced smartwatch featuring heart rate monitoring.',
        price: 299.99,
        stock_quantity: 15,
        category: 'electronics',
        image_url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg',
        seller_id: sellerId,
        is_approved: true,
        average_rating: 4.2,
        review_count: 8
      },
      {
        id: uuidv4(),
        name: 'Portable Bluetooth Speaker',
        description: 'Compact speaker with powerful sound and waterproof design.',
        price: 79.99,
        stock_quantity: 3,
        category: 'electronics',
        image_url: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg',
        seller_id: sellerId,
        is_approved: true,
        average_rating: 4.0,
        review_count: 15
      },
      // Clothing
      {
        id: uuidv4(),
        name: 'Premium Cotton T-Shirt',
        description: 'Comfortable and stylish cotton t-shirt available in multiple colors.',
        price: 29.99,
        stock_quantity: 50,
        category: 'clothing',
        image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg',
        seller_id: sellerId,
        is_approved: true,
        average_rating: 4.3,
        review_count: 22
      },
      {
        id: uuidv4(),
        name: 'Denim Jacket',
        description: 'Classic denim jacket with modern fit and premium quality.',
        price: 89.99,
        stock_quantity: 20,
        category: 'clothing',
        image_url: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg',
        seller_id: sellerId,
        is_approved: true,
        average_rating: 4.7,
        review_count: 18
      },
      {
        id: uuidv4(),
        name: 'Running Sneakers',
        description: 'Lightweight running shoes with advanced cushioning technology.',
        price: 129.99,
        stock_quantity: 0,
        category: 'clothing',
        image_url: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
        seller_id: sellerId,
        is_approved: true,
        average_rating: 4.6,
        review_count: 31
      },
      // Home & Garden
      {
        id: uuidv4(),
        name: 'Ceramic Plant Pot Set',
        description: 'Beautiful set of 3 ceramic plant pots perfect for indoor plants.',
        price: 45.99,
        stock_quantity: 12,
        category: 'home-garden',
        image_url: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg',
        seller_id: sellerId,
        is_approved: true,
        average_rating: 4.4,
        review_count: 9
      },
      {
        id: uuidv4(),
        name: 'LED Desk Lamp',
        description: 'Adjustable LED desk lamp with multiple brightness levels and USB charging port.',
        price: 59.99,
        stock_quantity: 8,
        category: 'home-garden',
        image_url: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg',
        seller_id: sellerId,
        is_approved: true,
        average_rating: 4.1,
        review_count: 14
      },
      // Books
      {
        id: uuidv4(),
        name: 'JavaScript: The Complete Guide',
        description: 'Comprehensive guide to modern JavaScript programming with practical examples.',
        price: 39.99,
        stock_quantity: 30,
        category: 'books',
        image_url: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
        seller_id: sellerId,
        is_approved: true,
        average_rating: 4.8,
        review_count: 45
      },
      {
        id: uuidv4(),
        name: 'The Art of Cooking',
        description: 'Master the fundamentals of cooking with this beautifully illustrated cookbook.',
        price: 34.99,
        stock_quantity: 18,
        category: 'books',
        image_url: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg',
        seller_id: sellerId,
        is_approved: true,
        average_rating: 4.5,
        review_count: 27
      },
      // Sports & Fitness
      {
        id: uuidv4(),
        name: 'Yoga Mat Premium',
        description: 'Non-slip yoga mat with extra cushioning for comfortable practice.',
        price: 49.99,
        stock_quantity: 22,
        category: 'sports-fitness',
        image_url: 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg',
        seller_id: sellerId,
        is_approved: true,
        average_rating: 4.3,
        review_count: 19
      },
      {
        id: uuidv4(),
        name: 'Resistance Bands Set',
        description: 'Complete set of resistance bands for full-body workouts at home.',
        price: 24.99,
        stock_quantity: 35,
        category: 'sports-fitness',
        image_url: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg',
        seller_id: sellerId,
        is_approved: true,
        average_rating: 4.2,
        review_count: 33
      }
    ];

    const insertProduct = db.prepare(`
      INSERT INTO products (id, name, description, price, stock_quantity, category, image_url, seller_id, is_approved, average_rating, review_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    products.forEach(product => {
      insertProduct.run(
        product.id, product.name, product.description, product.price,
        product.stock_quantity, product.category, product.image_url,
        product.seller_id, product.is_approved, product.average_rating, product.review_count
      );
    });

    // Create sample reviews
    const reviews = [
      {
        id: uuidv4(),
        product_id: products[0].id,
        user_id: customerId,
        rating: 5,
        comment: 'Excellent headphones! Great sound quality and battery life.'
      },
      {
        id: uuidv4(),
        product_id: products[1].id,
        user_id: customerId,
        rating: 4,
        comment: 'Good smartwatch with accurate fitness tracking.'
      },
      {
        id: uuidv4(),
        product_id: products[3].id,
        user_id: customerId,
        rating: 4,
        comment: 'Very comfortable t-shirt, great quality cotton.'
      }
    ];

    const insertReview = db.prepare(`
      INSERT INTO reviews (id, product_id, user_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `);

    reviews.forEach(review => {
      insertReview.run(review.id, review.product_id, review.user_id, review.rating, review.comment);
    });

    // Create sample orders
    const orders = [
      {
        id: uuidv4(),
        user_id: customerId,
        total_amount: 229.98,
        status: 'delivered',
        shipping_address: JSON.stringify({
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA'
        })
      },
      {
        id: uuidv4(),
        user_id: customerId,
        total_amount: 89.99,
        status: 'shipped',
        shipping_address: JSON.stringify({
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA'
        })
      }
    ];

    const insertOrder = db.prepare(`
      INSERT INTO orders (id, user_id, total_amount, status, shipping_address)
      VALUES (?, ?, ?, ?, ?)
    `);

    orders.forEach(order => {
      insertOrder.run(order.id, order.user_id, order.total_amount, order.status, order.shipping_address);
    });

    // Create order items
    const orderItems = [
      {
        id: uuidv4(),
        order_id: orders[0].id,
        product_id: products[0].id,
        quantity: 1,
        price: 199.99
      },
      {
        id: uuidv4(),
        order_id: orders[0].id,
        product_id: products[3].id,
        quantity: 1,
        price: 29.99
      },
      {
        id: uuidv4(),
        order_id: orders[1].id,
        product_id: products[4].id,
        quantity: 1,
        price: 89.99
      }
    ];

    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (id, order_id, product_id, quantity, price)
      VALUES (?, ?, ?, ?, ?)
    `);

    orderItems.forEach(item => {
      insertOrderItem.run(item.id, item.order_id, item.product_id, item.quantity, item.price);
    });

    // Create sample notifications
    const notifications = [
      {
        id: uuidv4(),
        user_id: customerId,
        title: 'Order Delivered',
        message: 'Your order #' + orders[0].id.substring(0, 8) + ' has been delivered successfully!',
        type: 'success'
      },
      {
        id: uuidv4(),
        user_id: customerId,
        title: 'Order Shipped',
        message: 'Your order #' + orders[1].id.substring(0, 8) + ' has been shipped and is on its way!',
        type: 'info'
      },
      {
        id: uuidv4(),
        user_id: sellerId,
        title: 'Low Stock Alert',
        message: 'Portable Bluetooth Speaker is running low on stock (3 units remaining).',
        type: 'warning'
      },
      {
        id: uuidv4(),
        user_id: sellerId,
        title: 'Product Out of Stock',
        message: 'Running Sneakers is now out of stock. Please restock soon.',
        type: 'error'
      },
      {
        id: uuidv4(),
        user_id: adminId,
        title: 'New User Registration',
        message: 'A new seller has registered and is awaiting approval.',
        type: 'info'
      }
    ];

    const insertNotification = db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES (?, ?, ?, ?, ?)
    `);

    notifications.forEach(notification => {
      insertNotification.run(
        notification.id, notification.user_id, notification.title,
        notification.message, notification.type
      );
    });

    console.log('Database seeded with dummy data successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
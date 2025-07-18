const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'ecommerce.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Session storage (in production, use proper session management)
let currentUser = null;

// Initialize database tables
const initializeDatabase = () => {
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
const seedDatabase = () => {
  try {
    // Check if data already exists
    const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (existingUsers.count > 0) {
      console.log('Database already seeded');
      return;
    }

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

    // Create sample products
    const products = [
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

// Initialize database on startup
initializeDatabase();
seedDatabase();

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName, role = 'customer' } = req.body;

    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = uuidv4();

    // Insert new user
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertUser.run(userId, email, passwordHash, fullName, role);

    res.json({ 
      success: true,
      user: { 
        id: userId, 
        email, 
        full_name: fullName, 
        role,
        created_at: new Date().toISOString(),
        is_banned: false
      } 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check if user is banned
    if (user.is_banned) {
      return res.status(403).json({ error: 'Your account has been banned. Please contact support.' });
    }

    // Set current user
    currentUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      is_banned: user.is_banned,
    };

    res.json({ 
      success: true,
      user: currentUser 
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/signout', (req, res) => {
  currentUser = null;
  res.json({ success: true });
});

app.get('/api/auth/user', (req, res) => {
  res.json({ user: currentUser });
});

// Products routes
app.get('/api/products', (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sortBy } = req.query;
    
    let query = `
      SELECT p.*, u.full_name as seller_name
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.is_approved = 1
    `;
    const params = [];

    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (minPrice) {
      query += ' AND p.price >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += ' AND p.price <= ?';
      params.push(parseFloat(maxPrice));
    }

    // Add sorting
    switch (sortBy) {
      case 'price_asc':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY p.price DESC';
        break;
      case 'rating':
        query += ' ORDER BY CAST(p.average_rating AS REAL) DESC';
        break;
      case 'newest':
        query += ' ORDER BY p.created_at DESC';
        break;
      default:
        query += ' ORDER BY p.created_at DESC';
    }

    const products = db.prepare(query).all(...params);
    const result = products.map(p => ({
      ...p,
      seller: p.seller_name ? { full_name: p.seller_name } : undefined
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const product = db.prepare(`
      SELECT p.*, u.full_name as seller_name
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.id = ?
    `).get(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const result = {
      ...product,
      seller: product.seller_name ? { full_name: product.seller_name } : undefined
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cart routes
app.get('/api/cart/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const items = db.prepare(`
      SELECT ci.*, p.name, p.price, p.image_url, p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(userId);

    const result = items.map(item => ({
      ...item,
      product: {
        id: item.product_id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        stock_quantity: item.stock_quantity
      }
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cart', (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    // Check if item already exists
    const existingItem = db.prepare(`
      SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?
    `).get(userId, productId);

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

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/cart/:itemId', (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      db.prepare('DELETE FROM cart_items WHERE id = ?').run(itemId);
    } else {
      db.prepare(`
        UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(quantity, itemId);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cart/:itemId', (req, res) => {
  try {
    const { itemId } = req.params;
    db.prepare('DELETE FROM cart_items WHERE id = ?').run(itemId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cart/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reviews routes
app.get('/api/products/:productId/reviews', (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = db.prepare(`
      SELECT r.*, u.full_name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `).all(productId);

    const result = reviews.map(review => ({
      ...review,
      user: { full_name: review.user_name }
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reviews', (req, res) => {
  try {
    const { productId, userId, rating, comment } = req.body;
    const reviewId = uuidv4();

    db.prepare(`
      INSERT INTO reviews (id, product_id, user_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `).run(reviewId, productId, userId, rating, comment);

    // Update product rating
    const reviews = db.prepare(`
      SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as count
      FROM reviews WHERE product_id = ?
    `).get(productId);

    db.prepare(`
      UPDATE products SET average_rating = ?, review_count = ?
      WHERE id = ?
    `).run(reviews.avg_rating, reviews.count, productId);

    res.json({ id: reviewId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
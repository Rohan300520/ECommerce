# E-Commerce Platform with Inventory Management

A comprehensive e-commerce platform featuring role-based access control, real-time inventory management, and secure payment processing.

## Demo Users

Use these credentials to test different user workflows:

### Admin User
- **Email**: admin@example.com
- **Password**: password123
- **Access**: User management, product moderation, order oversight, platform analytics

### Seller User  
- **Email**: seller@example.com
- **Password**: password123
- **Access**: Product management, inventory tracking, order fulfillment

### Customer User
- **Email**: customer@example.com
- **Password**: password123
- **Access**: Product browsing, shopping cart, order tracking, reviews

## Features

### Customer Workflow
- Browse featured products and categories
- Advanced search and filtering
- Shopping cart management
- Secure checkout with Stripe
- Order tracking and history
- Product reviews and ratings

### Seller Workflow
- Product listing management
- Real-time inventory tracking
- Low-stock alerts
- Order status updates
- Sales analytics

### Admin Workflow
- User management and role assignment
- Product approval and moderation
- Order oversight and management
- Platform analytics and reporting

## Sample Data

The platform includes:
- **20+ Sample Products** across 5 categories (Electronics, Clothing, Home & Garden, Books, Sports & Fitness)
- **Product Reviews** with ratings and detailed comments
- **Order History** with different statuses (pending, confirmed, shipped, delivered)
- **Real-time Notifications** for all user types
- **Inventory Alerts** for low-stock and out-of-stock items

## Getting Started

1. Click "Connect to Supabase" to set up your database
2. The migrations will automatically create all tables and sample data
3. Use the demo credentials above to explore different user workflows
4. Test the complete e-commerce experience from browsing to checkout

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Payments**: Stripe (ready for integration)
- **Real-time**: WebSocket notifications
- **State Management**: React Context + Custom Hooks
# E-Commerce Platform with SQLite Database

A comprehensive e-commerce platform featuring role-based access control, real-time inventory management, and local SQLite database.

## Demo Users

Use these credentials to test different user workflows:

### 🔧 Admin User
- **Email**: admin@example.com
- **Password**: password123
- **Access**: User management, product moderation, order oversight, platform analytics

### 🏪 Seller User  
- **Email**: seller@example.com
- **Password**: password123
- **Access**: Product management, inventory tracking, order fulfillment

### 🛒 Customer User
- **Email**: customer@example.com
- **Password**: password123
- **Access**: Product browsing, shopping cart, order tracking, reviews

## Features

### Customer Workflow
- Browse featured products and categories
- Advanced search and filtering
- Shopping cart management
- Product reviews and ratings
- Order history tracking

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
- **12+ Sample Products** across 5 categories (Electronics, Clothing, Home & Garden, Books, Sports & Fitness)
- **Product Reviews** with ratings and detailed comments
- **Order History** with different statuses (pending, confirmed, shipped, delivered)
- **Real-time Notifications** for all user types
- **Inventory Alerts** for low-stock and out-of-stock items

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation Steps

1. **Clone or download the project**
   ```bash
   cd your-project-directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to: http://localhost:5173

The SQLite database will be automatically created and seeded with dummy data on first run.

## Database

The application uses SQLite with the following features:
- **Local database file**: `ecommerce.db` (created automatically)
- **Auto-initialization**: Database tables and sample data are created on first run
- **No external dependencies**: Everything runs locally

### Database Schema
- **users**: User accounts with role-based access
- **products**: Product catalog with inventory tracking
- **cart_items**: Shopping cart functionality
- **orders & order_items**: Order management system
- **reviews**: Product review and rating system
- **notifications**: User notification system
- **categories**: Product categorization

## Testing the Application

### Demo User Workflows

1. **Customer Workflow:**
   - Browse the homepage and featured products
   - Search and filter products by category, price, rating
   - View product details and read reviews
   - Add items to shopping cart
   - View order history and notifications

2. **Seller Workflow:**
   - Access seller dashboard (coming soon)
   - Manage product inventory
   - View low-stock alerts
   - Update order statuses

3. **Admin Workflow:**
   - Access admin dashboard (coming soon)
   - Manage users and roles
   - Moderate products
   - View platform analytics

## Development Commands

- **Start development server:** `npm run dev`
- **Build for production:** `npm run build`
- **Preview production build:** `npm run preview`
- **Run linting:** `npm run lint`

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Database**: SQLite with better-sqlite3
- **Authentication**: Local authentication with bcrypt
- **State Management**: React Context + Custom Hooks
- **Routing**: React Router
- **Styling**: Tailwind CSS with custom design system

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── context/            # React context providers
├── lib/                # Database and API functions
├── types/              # TypeScript type definitions
└── styles/             # CSS and styling files
```

## Database File

The SQLite database file (`ecommerce.db`) will be created in the project root directory. This file contains all your data and can be backed up or transferred as needed.

## Troubleshooting

### Common Issues:

**Port already in use:**
```bash
npm run dev -- --port 3001
```

**Dependencies not installing:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Database issues:**
- Delete `ecommerce.db` file and restart the application to recreate the database
- Check console for any database initialization errors

The application should now be running locally with all the dummy data and user accounts ready for testing!
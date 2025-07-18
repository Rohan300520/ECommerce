# E-Commerce Platform with SQLite Backend

A full-stack e-commerce platform with separate frontend and backend services.

## Demo User Credentials

### Admin User
- **Email**: `admin@example.com`
- **Password**: `password123`
- **Access**: User management, product moderation, order oversight

### Seller User  
- **Email**: `seller@example.com`
- **Password**: `password123`
- **Access**: Product management, inventory tracking, order fulfillment

### Customer User
- **Email**: `customer@example.com`
- **Password**: `password123`
- **Access**: Shopping, cart, checkout, order tracking, reviews

## Setup Instructions

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Start the Backend Server
```bash
cd server
npm run dev
```
The backend will run on `http://localhost:3001`

### 4. Start the Frontend (in a new terminal)
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

## Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── context/           # React context providers
│   ├── lib/               # API client and utilities
│   └── types/             # TypeScript type definitions
├── server/                # Backend Node.js/Express server
│   ├── index.js           # Main server file
│   ├── package.json       # Backend dependencies
│   └── ecommerce.db       # SQLite database (auto-created)
└── README.md
```

## Features

### Customer Workflow
- Browse products with search and filtering
- View detailed product information and reviews
- Add items to shopping cart
- View order history
- Submit product reviews

### Seller Workflow
- Manage product inventory
- Track stock levels
- View order notifications

### Admin Workflow
- User management
- Product moderation
- Platform oversight

## Sample Data

The application comes pre-loaded with:
- **12+ Products** across 5 categories
- **Sample Reviews** with ratings and comments
- **Order History** with various statuses
- **Notifications** for different user types
- **Realistic Stock Levels** including low-stock items

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/user` - Get current user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID

### Cart
- `GET /api/cart/:userId` - Get user's cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item quantity
- `DELETE /api/cart/:itemId` - Remove item from cart

### Reviews
- `GET /api/products/:productId/reviews` - Get product reviews
- `POST /api/reviews` - Create new review

## Development

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
```bash
cd server
npm run dev          # Start with nodemon (auto-restart)
npm start            # Start production server
```

## Database

The application uses SQLite with the following tables:
- `users` - User accounts and authentication
- `products` - Product catalog
- `cart_items` - Shopping cart items
- `orders` - Order records
- `order_items` - Individual order items
- `reviews` - Product reviews and ratings
- `notifications` - User notifications

The database is automatically created and seeded with sample data when the backend starts.
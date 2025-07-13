export interface User {
  id: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  is_banned?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category: string;
  image_url: string;
  seller_id: string;
  seller?: User;
  is_approved: boolean;
  average_rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: User;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}
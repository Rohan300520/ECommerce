import { Product, CartItem, Order, OrderItem, Review, User } from '../types';

const API_BASE_URL = '/api';

// Products API
export const getProducts = async (filters?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}): Promise<Product[]> => {
  const params = new URLSearchParams();
  
  if (filters?.category) params.append('category', filters.category);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
  if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);

  const response = await fetch(`${API_BASE_URL}/products?${params}`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch product');
  }
  return response.json();
};

// Cart API
export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  const response = await fetch(`${API_BASE_URL}/cart/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch cart items');
  return response.json();
};

export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, productId, quantity }),
  });
  if (!response.ok) throw new Error('Failed to add to cart');
  return response.json();
};

export const updateCartItemQuantity = async (itemId: string, quantity: number) => {
  const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) throw new Error('Failed to update cart item');
  return response.json();
};

export const removeFromCart = async (itemId: string) => {
  const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to remove from cart');
  return response.json();
};

export const clearCart = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/cart/user/${userId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to clear cart');
  return response.json();
};

// Reviews API
export const getProductReviews = async (productId: string): Promise<Review[]> => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`);
  if (!response.ok) throw new Error('Failed to fetch reviews');
  return response.json();
};

export const createReview = async (productId: string, userId: string, rating: number, comment: string) => {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, userId, rating, comment }),
  });
  if (!response.ok) throw new Error('Failed to create review');
  return response.json();
};

// Orders API (placeholder for future implementation)
export const getOrders = async (userId: string): Promise<Order[]> => {
  // TODO: Implement orders API
  return [];
};

export const createOrder = async (userId: string, items: CartItem[], shippingAddress: any) => {
  // TODO: Implement create order API
  return '';
};

// Notifications API (placeholder for future implementation)
export const getNotifications = async (userId: string) => {
  // TODO: Implement notifications API
  return [];
};

export const markNotificationAsRead = async (notificationId: string) => {
  // TODO: Implement mark notification as read API
};

// Admin API (placeholder for future implementation)
export const getAllUsers = async (): Promise<User[]> => {
  // TODO: Implement admin users API
  return [];
};

export const updateUserRole = async (userId: string, role: string) => {
  // TODO: Implement update user role API
};

export const banUser = async (userId: string, banned: boolean) => {
  // TODO: Implement ban user API
};

export const getAllProducts = async (): Promise<Product[]> => {
  // TODO: Implement admin products API
  return [];
};

export const approveProduct = async (productId: string, approved: boolean) => {
  // TODO: Implement approve product API
};
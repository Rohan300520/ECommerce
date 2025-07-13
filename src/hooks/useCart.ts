import { useState, useEffect } from 'react';
import { CartItem } from '../types';
import { getCartItems, addToCart as apiAddToCart, updateCartItemQuantity, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useCart = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCartItems = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const cartItems = await getCartItems(user.id);
      setItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await apiAddToCart(user.id, productId, quantity);
      await fetchCartItems();
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await updateCartItemQuantity(itemId, quantity);
      await fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await apiRemoveFromCart(itemId);
      await fetchCartItems();
      toast.success('Removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      await apiClearCart(user.id);
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  return {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    refetch: fetchCartItems,
  };
};
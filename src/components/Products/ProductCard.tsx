import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../context/AuthContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200">
        <div className="aspect-w-1 aspect-h-1 relative overflow-hidden">
          <img
            src={product.image_url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
              Low Stock
            </div>
          )}
          {product.stock_quantity === 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Out of Stock
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {renderStars(Math.round(product.average_rating || 0))}
            </div>
            <span className="text-sm text-gray-500 ml-2">
              ({product.review_count || 0} reviews)
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-600">
              ${product.price.toFixed(2)}
            </span>
            
            {user && product.stock_quantity > 0 && (
              <button
                onClick={handleAddToCart}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>
            )}
          </div>
          
          <div className="mt-2 text-sm text-gray-500">
            Stock: {product.stock_quantity} units
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import { getProductById, getProductReviews, createReview } from '../lib/api';
import { Product, Review } from '../types';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const [productData, reviewsData] = await Promise.all([
        getProductById(id),
        getProductReviews(id)
      ]);
      
      setProduct(productData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id, quantity);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) {
      toast.error('Please login to submit a review');
      return;
    }

    try {
      await createReview(product.id, user.id, reviewForm.rating, reviewForm.comment);
      toast.success('Review submitted successfully');
      setReviewForm({ rating: 5, comment: '' });
      fetchProductDetails(); // Refresh to show new review
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={interactive && onRatingChange ? () => onRatingChange(i + 1) : undefined}
      />
    ));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-300 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="bg-gray-300 h-8 rounded w-3/4"></div>
              <div className="bg-gray-300 h-4 rounded w-1/2"></div>
              <div className="bg-gray-300 h-6 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          <img
            src={product.image_url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-2">by {product.seller?.full_name || 'Unknown Seller'}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {renderStars(Math.round(product.average_rating || 0))}
            </div>
            <span className="text-sm text-gray-500">
              ({product.review_count || 0} reviews)
            </span>
          </div>

          <div className="text-3xl font-bold text-blue-600">
            ${product.price.toFixed(2)}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Stock: {product.stock_quantity} units available
            </p>
            {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
              <p className="text-orange-600 text-sm font-medium">
                Only {product.stock_quantity} left in stock!
              </p>
            )}
            {product.stock_quantity === 0 && (
              <p className="text-red-600 text-sm font-medium">Out of stock</p>
            )}
          </div>

          {user && product.stock_quantity > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  {Array.from({ length: Math.min(10, product.stock_quantity) }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <Truck className="h-6 w-6 text-blue-600" />
                <span className="text-sm text-gray-600">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <span className="text-sm text-gray-600">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <RotateCcw className="h-6 w-6 text-blue-600" />
                <span className="text-sm text-gray-600">30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['description', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {activeTab === 'description' && (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Review Form */}
            {user && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex items-center space-x-1">
                      {renderStars(reviewForm.rating, true, (rating) =>
                        setReviewForm(prev => ({ ...prev, rating }))
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comment
                    </label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Share your thoughts about this product..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Customer Reviews</h3>
              {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {review.user?.full_name || 'Anonymous'}
                        </span>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
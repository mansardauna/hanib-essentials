'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { PlayCircle, Star, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { user } = useAuth();
  
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [reviews, setReviews] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    supabase.from('products').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (!error && data) {
          setProduct(data);
          if (data.reviews) {
            setReviews(data.reviews);
          }
        }
      })
      .catch(console.error);
  }, [id]);

  const addToCart = () => {
    if (product.stock <= 0) return alert('Out of stock!');
    
    const savedCart = localStorage.getItem('hanib_cart_v2');
    let cart = savedCart ? JSON.parse(savedCart) : [];
    
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return alert('Cannot add more than available stock.');
      cart = cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('hanib_cart_v2', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    alert('Added to cart!');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login to submit a review");
    if (!reviewText.trim()) return;
    setIsSubmittingReview(true);
    
    const newReviews = [
      ...(reviews || []),
      {
        user: user.username,
        rating,
        text: reviewText,
        date: new Date().toISOString()
      }
    ];
    
    try {
      const { data, error } = await supabase.from('products').update({ reviews: newReviews }).eq('id', product.id).select();

      if (!error && data) {
        setReviews(newReviews);
        setReviewText('');
        setRating(5);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!product) return <div className="container" style={{padding: '4rem 1rem'}}>Loading...</div>;

  return (
    <main className="container product-page">
      <div className="product-grid">
        <div className="product-media">
          <div className="main-image">
            {product.image ? (
              <Image src={product.image} alt={product.name} fill style={{objectFit: 'contain'}} />
            ) : (
              <span className="placeholder-text">{product.name.charAt(0)}</span>
            )}
          </div>
        </div>
        
        <div className="product-details">
          <p className="category">{product.category}</p>
          <h1 className="title">{product.name}</h1>
          <div className="price-section">
            <span className="price">₦{product.price.toLocaleString()}</span>
            {product.specialOffer && <span className="badge">Special Offer</span>}
          </div>
          
          <div className="info-block">
            <p className="delivery"><strong>Delivery Fee:</strong> ₦{product.deliveryFee.toLocaleString()}</p>
            <p className="stock">
              <strong>Availability:</strong>{' '}
              {product.stock > 0 ? (
                <span>{product.stock} in stock</span>
              ) : (
                <span style={{color: 'red'}}>Out of stock</span>
              )}
            </p>
          </div>

          <div className="description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {user?.role !== 'owner' && (
            <button 
              onClick={addToCart} 
              className="btn btn-primary add-btn"
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          )}
        </div>
      </div>

      <div className="video-section">
        <h2>Product Video Review</h2>
        {product.video ? (
          <div className="video-container">
            <video 
              src={product.video} 
              autoPlay 
              loop 
              muted 
              playsInline 
              controls 
              className="product-video"
            />
          </div>
        ) : (
          <div className="video-placeholder">
            <PlayCircle size={64} className="play-icon" />
            <p>No video available for this product.</p>
          </div>
        )}
      </div>

      <div className="reviews-section">
        <h2>Customer Reviews</h2>
        
        {user?.role === 'customer' && (
          <form className="review-form card" onSubmit={submitReview}>
            <h3>Write a Review</h3>
            <div className="mui-form-group">
              <select className="mui-input" value={rating} onChange={e => setRating(Number(e.target.value))}>
                <option value={5}>5 Stars - Excellent</option>
                <option value={4}>4 Stars - Good</option>
                <option value={3}>3 Stars - Average</option>
                <option value={2}>2 Stars - Poor</option>
                <option value={1}>1 Star - Terrible</option>
              </select>
              <label className="mui-label">Rating</label>
            </div>
            <div className="mui-form-group">
              <textarea 
                className="mui-input" 
                rows="3" 
                value={reviewText} 
                onChange={e => setReviewText(e.target.value)}
                placeholder=" "
                required
              ></textarea>
              <label className="mui-label">Your Review</label>
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmittingReview}>
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        <div className="reviews-list">
          {(!product.reviews || product.reviews.length === 0) ? (
            <p style={{color: 'var(--muted-foreground)'}}>No reviews yet. Be the first to review this product!</p>
          ) : (
            product.reviews.map((rev, idx) => (
              <div key={idx} className="review-card card">
                <div className="review-header">
                  <div className="reviewer">
                    <div className="avatar"><User size={20}/></div>
                    <span>{rev.user}</span>
                  </div>
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < rev.rating ? "var(--primary)" : "none"} color={i < rev.rating ? "var(--primary)" : "var(--muted-foreground)"} />
                    ))}
                  </div>
                </div>
                <p className="review-text">{rev.text}</p>
                {rev.date && <p style={{fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '0.5rem'}}>{new Date(rev.date).toLocaleDateString()}</p>}
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .product-page {
          padding: 3rem 1rem;
        }
        .product-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          margin-bottom: 4rem;
        }
        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: 1fr;
          }
        }
        .main-image {
          width: 100%;
          height: 500px;
          background: var(--muted);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
        }
        .placeholder-text {
          font-size: 5rem;
          font-weight: 900;
          color: var(--border);
        }
        .category {
          text-transform: uppercase;
          font-size: 0.875rem;
          color: var(--muted-foreground);
          margin-bottom: 0.5rem;
        }
        .title {
          font-size: 2.5rem;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
        }
        .price-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .price {
          font-size: 2rem;
          font-weight: 700;
        }
        .badge {
          background: var(--foreground);
          color: var(--background);
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .info-block {
          margin-bottom: 2rem;
        }
        .info-block p {
          margin-bottom: 0.5rem;
        }
        .description {
          margin-bottom: 2rem;
        }
        .description h3 {
          text-transform: uppercase;
          margin-bottom: 1rem;
        }
        .description p {
          color: var(--muted-foreground);
          line-height: 1.6;
        }
        .add-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1.125rem;
        }
        .add-btn:disabled {
          background: var(--muted);
          color: var(--muted-foreground);
          border-color: var(--border);
          cursor: not-allowed;
        }
        .video-section h2, .reviews-section h2 {
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          font-weight: 600;
        }
        .video-container {
          width: 100%;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: #000;
          display: flex;
          justify-content: center;
          margin-bottom: 4rem;
        }
        .product-video {
          max-width: 100%;
          max-height: 600px;
        }
        .video-placeholder {
          width: 100%;
          height: 400px;
          background: var(--muted);
          color: var(--muted-foreground);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          border-radius: var(--radius-lg);
          margin-bottom: 4rem;
        }
        .play-icon {
          opacity: 0.5;
        }
        .reviews-section {
          margin-top: 2rem;
        }
        .review-form {
          padding: 2rem;
          margin-bottom: 2rem;
        }
        .review-form h3 {
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          font-size: 1rem;
        }
        .reviews-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 768px) {
          .reviews-list {
            grid-template-columns: 1fr 1fr;
          }
        }
        .review-card {
          padding: 1.5rem;
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .reviewer {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
        }
        .avatar {
          width: 32px; height: 32px;
          background: var(--muted);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stars {
          display: flex;
          gap: 0.25rem;
        }
        .review-text {
          color: var(--muted-foreground);
          font-size: 0.875rem;
          line-height: 1.5;
        }
      `}</style>
    </main>
  );
}

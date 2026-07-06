'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { PlayCircle, Star, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { user } = useAuth();
  
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [reviews, setReviews] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400 text-xl">Loading product...</div>;

  const images = product.image ? product.image.split(',').filter(Boolean) : [];
  
  const nextImage = () => setCurrentImageIndex(prev => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Product Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Image Carousel */}
        <div className="space-y-4">
          <div className="relative bg-white border border-slate-100 rounded-[2rem] shadow-sm aspect-square overflow-hidden flex items-center justify-center group">
            {images.length > 0 ? (
              <>
                <Image src={images[currentImageIndex]} alt={product.name} fill className="object-contain p-8 transition-transform duration-500 hover:scale-105" />
                
                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 p-3 bg-white/80 backdrop-blur-sm text-slate-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-brand-500">
                      <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextImage} className="absolute right-4 p-3 bg-white/80 backdrop-blur-sm text-slate-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-brand-500">
                      <ChevronRight size={24} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                      {images.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? 'bg-white' : 'bg-white/40'}`} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <span className="text-8xl font-black text-slate-200">{product.name.charAt(0)}</span>
            )}
          </div>
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentImageIndex(i)}
                  className={`relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${i === currentImageIndex ? 'border-brand-500 shadow-md scale-105' : 'border-slate-100 opacity-70 hover:opacity-100'}`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-brand-50 text-brand-600 font-bold uppercase tracking-widest text-xs rounded-full">
              {product.category}
            </span>
            {product.specialOffer && (
              <span className="px-4 py-1.5 bg-vibrant-pink/10 text-vibrant-pink font-bold uppercase tracking-widest text-xs rounded-full">
                Special Offer
              </span>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight">
            {product.name}
          </h1>
          
          <div className="flex items-end gap-4 py-6 border-y border-slate-100">
            <span className="text-4xl font-black text-slate-900">₦{product.price.toLocaleString()}</span>
            <span className="text-sm font-bold text-slate-500 mb-1">
              + ₦{product.deliveryFee.toLocaleString()} Delivery
            </span>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Description</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              {product.description}
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <div className={`px-4 py-2 rounded-xl text-sm font-bold ${product.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
            </div>
          </div>
          
          {user?.role !== 'owner' && (
            <div className="mt-8">
              <button 
                onClick={addToCart} 
                disabled={product.stock <= 0}
                className="w-full py-5 bg-gradient-peach text-white text-xl font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
              >
                {product.stock > 0 ? 'Add to Cart' : 'Currently Unavailable'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Video Section */}
      {product.video && (
        <div className="space-y-6 pt-12 border-t border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest">Product Video</h2>
          <div className="w-full max-w-4xl mx-auto bg-black rounded-[2rem] overflow-hidden shadow-xl aspect-video flex items-center justify-center">
            <video 
              src={product.video} 
              autoPlay 
              loop 
              muted 
              playsInline 
              controls 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="space-y-8 pt-12 border-t border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Write a review (Visible to logged in customers OR prompts login) */}
          <div className="lg:col-span-1">
            {user ? (
              user.role === 'customer' ? (
                <form className="bg-white p-8 rounded-[2rem] border border-brand-100 shadow-sm space-y-6 sticky top-24" onSubmit={submitReview}>
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider">Write a Review</h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rating</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-400 font-medium text-slate-800" 
                      value={rating} 
                      onChange={e => setRating(Number(e.target.value))}
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ - Excellent</option>
                      <option value={4}>⭐⭐⭐⭐ - Good</option>
                      <option value={3}>⭐⭐⭐ - Average</option>
                      <option value={2}>⭐⭐ - Poor</option>
                      <option value={1}>⭐ - Terrible</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Your Review</label>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-400 font-medium text-slate-800 resize-none" 
                      rows="4" 
                      value={reviewText} 
                      onChange={e => setReviewText(e.target.value)}
                      placeholder="Share your thoughts about this product..."
                      required
                    ></textarea>
                  </div>
                  
                  <button type="submit" className="w-full py-3.5 bg-slate-800 text-white font-bold rounded-xl shadow-md hover:bg-slate-900 transition-colors" disabled={isSubmittingReview}>
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="bg-brand-50 p-8 rounded-[2rem] border border-brand-100 text-center space-y-4">
                  <User size={48} className="mx-auto text-brand-300" />
                  <p className="font-bold text-brand-700">Store owners cannot leave reviews.</p>
                </div>
              )
            ) : (
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 text-center space-y-4 sticky top-24">
                <Star size={48} className="mx-auto text-slate-300" />
                <h3 className="font-bold text-slate-800 uppercase tracking-wider">Have this product?</h3>
                <p className="text-slate-600 text-sm">Please log in to share your experience with other customers.</p>
                <Link href="/auth" className="inline-block px-6 py-3 bg-brand-500 text-white font-bold rounded-xl shadow-sm hover:bg-brand-600 transition-colors w-full mt-4">
                  Log in to review
                </Link>
              </div>
            )}
          </div>
          
          {/* Review List */}
          <div className="lg:col-span-2 space-y-6">
            {(!reviews || reviews.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed">
                <Star size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-500 font-medium text-lg">No reviews yet.</p>
                <p className="text-slate-400 text-sm">Be the first to review this product!</p>
              </div>
            ) : (
              reviews.map((rev, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-brand text-white rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
                        {rev.user.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">{rev.user}</span>
                        {rev.date && <span className="text-xs font-semibold text-slate-400">{new Date(rev.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} fill={i < rev.rating ? "#ffcc4d" : "transparent"} color={i < rev.rating ? "#ffcc4d" : "#cbd5e1"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed pt-2 border-t border-slate-50">
                    "{rev.text}"
                  </p>
                </div>
              ))
            )}
          </div>
          
        </div>
      </div>
      
    </main>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';

function ShopContent() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('');
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';

  useEffect(() => {
    supabase.from('products').select('*')
      .then(({ data, error }) => {
        if (!error && data) setProducts(data);
      })
      .catch(console.error);
  }, []);

  const addToCart = (product, e) => {
    e.preventDefault(); 
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
  };

  const categories = ['All', 'Special Offers', 'School Items', 'Toys'];
  
  let displayedProducts = products.filter(p => {
    const matchesFilter = filter === 'All' ? true : (filter === 'Special Offers' ? p.specialOffer : p.category === filter);
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (sort === 'price-asc') {
    displayedProducts.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    displayedProducts.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    displayedProducts.sort((a, b) => b.id.localeCompare(a.id));
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 font-sans">
      {/* Banner Section */}
      <section 
        className="text-white rounded-3xl p-8 md:p-16 relative overflow-hidden flex items-center justify-center min-h-[400px]"
        style={{ backgroundImage: "linear-gradient(rgba(44, 62, 80, 0.7), rgba(44, 62, 80, 0.7)), url('/images/store_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="relative z-10 text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-semibold uppercase tracking-widest">Hanibessentials</h1>
          <p className="text-lg md:text-2xl text-white/90 font-medium">We sell Stationery, back-to-school items, and Household essentials.</p>
        </div>
      </section>

      {/* Filter & Sort Row */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-brand-100">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`px-6 py-2.5 rounded-full font-medium whitespace-nowrap transition-all shadow-sm ${filter === cat ? 'bg-gradient-brand text-white shadow-sm transform -translate-y-0.5' : 'bg-white text-slate-600 hover:bg-brand-50 border border-brand-100 hover:text-brand-600'}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <select value={sort} onChange={e => setSort(e.target.value)} className="w-full md:w-56 px-5 py-2.5 bg-white border border-brand-100 rounded-full shadow-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400">
          <option value="">Sort By</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="newest">Newest Arrivals</option>
        </select>
      </div>

      {filter === 'All' && !search ? (
        <>
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-brand inline-block">Trending Now</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedProducts.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} addToCart={addToCart} user={user} />
              ))}
            </div>
          </div>

          {displayedProducts.length > 4 && (
            <div className="space-y-6 pt-8">
              <h2 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-brand inline-block">Discover More Items</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedProducts.slice(4).map(product => (
                  <ProductCard key={product.id} product={product} addToCart={addToCart} user={user} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-brand inline-block">{search ? `Search Results for "${search}"` : filter}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedProducts.length === 0 ? (
              <p className="text-slate-500 italic col-span-full text-center py-12 bg-white/50 rounded-3xl font-medium">No products found.</p>
            ) : (
              displayedProducts.map(product => (
                <ProductCard key={product.id} product={product} addToCart={addToCart} user={user} />
              ))
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function ProductCard({ product, addToCart, user }) {
  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-sm hover:shadow-sm transition-all duration-300 border border-brand-100 hover:border-brand-300 transform hover:-translate-y-1">
      <div className="relative h-64 flex items-center justify-center p-6 border-b border-brand-50 group-hover:bg-white transition-colors bg-white">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-contain p-6 group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className="text-5xl font-semibold text-brand-200">{product.name.charAt(0)}</span>
        )}
        {product.specialOffer && <div className="absolute top-4 left-4 bg-vibrant-pink text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm uppercase tracking-wider">Offer</div>}
      </div>
      
      <div className="p-6 flex flex-col flex-1 gap-2">
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest">{product.category}</p>
        <h3 className="text-lg font-medium text-slate-800 line-clamp-2 group-hover:text-brand-600 transition-colors">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{product.description}</p>
        )}
        
        <div className="mt-auto pt-4 flex flex-col gap-1">
          <span className="text-2xl font-semibold text-slate-800">₦{product.price.toLocaleString()}</span>
          <span className="text-xs font-medium text-slate-400">
            {product.deliveryFee === 0 ? '🎉 Free Delivery' : `🚚 +₦${product.deliveryFee} Del`}
          </span>
        </div>
        
        <div className="text-xs font-medium mt-2 mb-4">
          {product.stock > 0 ? (
            <span className="text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">{product.stock} available</span>
          ) : (
            <span className="text-red-700 bg-red-100 px-2.5 py-1 rounded-md">Out of stock</span>
          )}
        </div>
        
        {user?.role !== 'owner' && (
          <button 
            onClick={(e) => addToCart(product, e)} 
            className={`w-full py-3 rounded-2xl font-medium text-sm transition-all shadow-sm ${product.stock > 0 ? 'bg-gradient-brand text-white hover:shadow-sm hover:scale-[1.02]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            disabled={product.stock <= 0}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Unavailable'}
          </button>
        )}
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-16 text-center text-brand-500 animate-pulse font-medium text-xl">Loading amazing products...</div>}>
      <ShopContent />
    </Suspense>
  );
}

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
    <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 font-sans">
      {/* Banner Section */}
      <section 
        className="text-white rounded-3xl p-8 md:p-24 relative overflow-hidden flex items-center justify-center min-h-[500px] mb-12 shadow-lg"
        style={{ backgroundImage: "linear-gradient(rgba(44, 62, 80, 0.7), rgba(44, 62, 80, 0.7)), url('/images/store_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="relative z-10 text-center space-y-6">
          <h1 className="text-4xl md:text-7xl font-bold uppercase tracking-widest drop-shadow-lg">Hanib essentials</h1>
          <p className="text-lg md:text-2xl text-white/90 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            We sell Stationery, back-to-school items, and Household essentials.
          </p>
        </div>
      </section>

      {/* Filter & Sort Row */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-brand-100 mb-8">
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
            <h2 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-brand inline-block mb-4">Trending Now</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayedProducts.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} addToCart={addToCart} user={user} />
              ))}
            </div>
          </div>

          {displayedProducts.length > 4 && (
            <div className="space-y-6 pt-12">
              <h2 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-brand inline-block mb-4">Discover More Items</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {displayedProducts.slice(4).map(product => (
                  <ProductCard key={product.id} product={product} addToCart={addToCart} user={user} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-brand inline-block mb-4">{search ? `Search Results for "${search}"` : filter}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
  // Support multiple images
  const imageUrls = product.image ? product.image.split(',') : [];
  const primaryImage = imageUrls.length > 0 ? imageUrls[0] : null;

  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-50 hover:border-brand-peach transform hover:-translate-y-2">
      <div className="relative h-64 flex items-center justify-center p-6 border-b border-slate-50 bg-slate-50 overflow-hidden">
        {primaryImage ? (
          <Image src={primaryImage} alt={product.name} fill className="object-contain p-6 group-hover:scale-110 transition-transform duration-700 ease-out" />
        ) : (
          <span className="text-5xl font-semibold text-slate-300">{product.name.charAt(0)}</span>
        )}
        {product.specialOffer && <div className="absolute top-4 left-4 bg-vibrant-pink text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md uppercase tracking-wider z-10">Offer</div>}
      </div>
      
      <div className="p-6 flex flex-col flex-1 gap-3 relative">
        <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">{product.category}</p>
        <h3 className="text-lg font-bold text-slate-800 line-clamp-2 group-hover:text-brand-peach transition-colors leading-tight">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{product.description}</p>
        )}
        
        <div className="mt-auto pt-4 flex flex-col gap-1">
          <span className="text-2xl font-black text-slate-900">₦{product.price.toLocaleString()}</span>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 self-start px-2 py-0.5 rounded-md mt-1">
            {product.deliveryFee === 0 ? '🎉 Free Delivery' : `🚚 +₦${product.deliveryFee} Delivery`}
          </span>
        </div>
        
        <div className="text-xs font-medium mt-1 mb-4">
          {product.stock > 0 ? (
            <span className="text-slate-500">{product.stock} left in stock</span>
          ) : (
            <span className="text-red-500 font-bold">Out of stock</span>
          )}
        </div>
        
        {user?.role !== 'owner' && (
          <button 
            onClick={(e) => addToCart(product, e)} 
            className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md ${product.stock > 0 ? 'bg-gradient-peach text-white hover:shadow-lg hover:opacity-90' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
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
    <Suspense fallback={<div className="w-full mx-auto p-16 text-center text-brand-500 animate-pulse font-medium text-xl">Loading amazing products...</div>}>
      <ShopContent />
    </Suspense>
  );
}

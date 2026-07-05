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
    e.preventDefault(); // Prevent navigating to detail page if clicked inside link
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
    <main className="shop-container">
      {/* Banner Section */}
      <section className="banner">
        <div className="banner-content">
          <h1>Hanibessentials</h1>
          <p>We sell Stationery, back-to-school items, and Household essentials.</p>
        </div>
      </section>

      {/* Filter & Sort Row */}
      <div className="filter-sort-row">
        <div className="filter-bar">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <select value={sort} onChange={e => setSort(e.target.value)} className="sort-select">
          <option value="">Sort By</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="newest">Newest Arrivals</option>
        </select>
      </div>

      {filter === 'All' && !search ? (
        <>
          <div className="category-section">
            <h2 className="section-title">Trending Now</h2>
            <div className="products-grid">
              {displayedProducts.slice(0, 4).map(product => (
                <Link href={`/product/${product.id}`} key={product.id} className="card product-card">
                  <div className="product-img">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} fill style={{objectFit: 'contain', padding: '1rem'}} />
                    ) : (
                      <span>{product.name.charAt(0)}</span>
                    )}
                    {product.specialOffer && <div className="badge">OFFER</div>}
                  </div>
                  <div className="product-info">
                    <p className="category-tag">{product.category}</p>
                    <h3 className="title" title={product.name}>{product.name}</h3>
                    {product.description && (
                      <p className="description-tag" style={{fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{product.description}</p>
                    )}
                    <div className="price-row">
                      <span className="price">₦{product.price.toLocaleString()}</span>
                      <span className="delivery">
                        {product.deliveryFee === 0 ? 'Free Delivery' : `+₦${product.deliveryFee} Del`}
                      </span>
                    </div>
                    <div className="stock-info">
                      {product.stock > 0 ? (
                        <span className="in-stock">{product.stock} available</span>
                      ) : (
                        <span className="out-of-stock">Out of stock</span>
                      )}
                    </div>
                    {user?.role !== 'owner' && (
                      <button 
                        onClick={(e) => addToCart(product, e)} 
                        className="btn btn-primary add-btn"
                        disabled={product.stock <= 0}
                      >
                        {product.stock > 0 ? 'Add to Cart' : 'Unavailable'}
                      </button>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {displayedProducts.length > 4 && (
            <div className="category-section" style={{marginTop: '4rem'}}>
              <h2 className="section-title">Discover More Items</h2>
              <div className="products-grid">
                {displayedProducts.slice(4).map(product => (
                  <Link href={`/product/${product.id}`} key={product.id} className="card product-card">
                    <div className="product-img">
                      {product.image ? (
                        <Image src={product.image} alt={product.name} fill style={{objectFit: 'contain', padding: '1rem'}} />
                      ) : (
                        <span>{product.name.charAt(0)}</span>
                      )}
                      {product.specialOffer && <div className="badge">OFFER</div>}
                    </div>
                    <div className="product-info">
                      <p className="category-tag">{product.category}</p>
                      <h3 className="title" title={product.name}>{product.name}</h3>
                      {product.description && (
                        <p className="description-tag" style={{fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{product.description}</p>
                      )}
                      <div className="price-row">
                        <span className="price">₦{product.price.toLocaleString()}</span>
                        <span className="delivery">
                          {product.deliveryFee === 0 ? 'Free Delivery' : `+₦${product.deliveryFee} Del`}
                        </span>
                      </div>
                      <div className="stock-info">
                        {product.stock > 0 ? (
                          <span className="in-stock">{product.stock} available</span>
                        ) : (
                          <span className="out-of-stock">Out of stock</span>
                        )}
                      </div>
                      {user?.role !== 'owner' && (
                        <button 
                          onClick={(e) => addToCart(product, e)} 
                          className="btn btn-primary add-btn"
                          disabled={product.stock <= 0}
                        >
                          {product.stock > 0 ? 'Add to Cart' : 'Unavailable'}
                        </button>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="category-section">
          <h2 className="section-title">{search ? `Search Results for "${search}"` : filter}</h2>
          <div className="products-grid">
            {displayedProducts.length === 0 ? (
              <p>No products found.</p>
            ) : (
              displayedProducts.map(product => (
                <Link href={`/product/${product.id}`} key={product.id} className="card product-card">
                  <div className="product-img">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} fill style={{objectFit: 'contain', padding: '1rem'}} />
                    ) : (
                      <span>{product.name.charAt(0)}</span>
                    )}
                    {product.specialOffer && <div className="badge">OFFER</div>}
                  </div>
                  <div className="product-info">
                    <p className="category-tag">{product.category}</p>
                    <h3 className="title" title={product.name}>{product.name}</h3>
                    {product.description && (
                      <p className="description-tag" style={{fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{product.description}</p>
                    )}
                    <div className="price-row">
                      <span className="price">₦{product.price.toLocaleString()}</span>
                      <span className="delivery">
                        {product.deliveryFee === 0 ? 'Free Delivery' : `+₦${product.deliveryFee} Del`}
                      </span>
                    </div>
                    <div className="stock-info">
                      {product.stock > 0 ? (
                        <span className="in-stock">{product.stock} available</span>
                      ) : (
                        <span className="out-of-stock">Out of stock</span>
                      )}
                    </div>
                    {user?.role !== 'owner' && (
                      <button 
                        onClick={(e) => addToCart(product, e)} 
                        className="btn btn-primary add-btn"
                        disabled={product.stock <= 0}
                      >
                        {product.stock > 0 ? 'Add to Cart' : 'Unavailable'}
                      </button>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .shop-container {
          padding: 2rem 1rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        .banner {
          background-image: linear-gradient(rgba(44, 62, 80, 0.7), rgba(44, 62, 80, 0.7)), url('/images/store_bg.png');
          background-size: cover;
          background-position: center;
          color: var(--primary-foreground);
          padding: 6rem 2rem;
          text-align: center;
          border-radius: var(--radius-xl);
          margin-bottom: 3rem;
          box-shadow: var(--shadow-md);
        }
        .banner-content h1 {
          font-size: 3rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 1rem;
        }
        .banner-content p {
          font-size: 1.25rem;
          color: #a0a0a0;
        }
        @media (max-width: 768px) {
          .banner {
            padding: 3rem 1rem;
          }
          .banner-content h1 {
            font-size: 2rem;
          }
          .banner-content p {
            font-size: 1rem;
          }
        }
        .filter-sort-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .sort-select {
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          padding: 0.75rem 1.25rem;
          font-size: 1rem;
          font-family: var(--font-poppins);
          background: var(--card);
          color: var(--foreground);
          outline: none;
          min-width: 200px;
          box-shadow: var(--shadow-sm);
        }
        @media (max-width: 768px) {
          .sort-select {
            width: 100%;
          }
        }
        .filter-bar {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          flex: 1;
        }
        .filter-btn {
          padding: 0.75rem 1.5rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          font-weight: 500;
          text-transform: capitalize;
          white-space: nowrap;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s;
        }
        .filter-btn:hover {
          background: var(--muted);
          transform: translateY(-2px);
        }
        .filter-btn.active {
          background: var(--primary);
          color: var(--primary-foreground);
          border-color: var(--primary);
        }
        .section-title {
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
          font-weight: 600;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 1024px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .products-grid {
            grid-template-columns: 1fr;
          }
        }
        .product-card {
          display: flex;
          flex-direction: column;
          color: inherit;
        }
        .product-img {
          height: 240px;
          background: var(--card);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border-bottom: 1px solid var(--border);
        }
        .badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: var(--destructive);
          color: var(--destructive-foreground);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          z-index: 10;
        }
        .product-info {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .category-tag {
          font-size: 0.75rem;
          color: var(--secondary-foreground);
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }
        .title {
          font-size: 1.1rem;
          margin-bottom: 1rem;
          font-weight: 600;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .price-row {
          display: flex;
          flex-direction: column;
          margin-top: auto;
          margin-bottom: 0.5rem;
        }
        .price {
          font-size: 1.25rem;
          font-weight: 700;
        }
        .delivery {
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }
        .stock-info {
          font-size: 0.75rem;
          margin-bottom: 1rem;
        }
        .in-stock {
          color: var(--foreground);
        }
        .out-of-stock {
          color: red;
          font-weight: 600;
        }
        .add-btn {
          width: 100%;
        }
        .add-btn:disabled {
          background: var(--muted);
          color: var(--muted-foreground);
          border-color: var(--border);
          cursor: not-allowed;
        }
      `}</style>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="container" style={{padding: '4rem 1rem'}}>Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}

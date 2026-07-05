'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, LogOut, Menu, Search, Home, Settings } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import CartModal from './CartModal';
import Sidebar from './Sidebar';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    supabase.from('products').select('*')
      .then(({ data, error }) => {
        if (!error && data) setAllProducts(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    const handleStorage = () => {
      const savedCart = localStorage.getItem('hanib_cart_v2');
      if (savedCart) setCart(JSON.parse(savedCart));
    };
    handleStorage();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <>
      <header className="navbar">
        <div className="container flex items-center justify-between">
          <div className="nav-left">
            <button onClick={() => setIsSidebarOpen(true)} className="menu-btn">
              <Menu size={24} />
            </button>
            <Link href="/" className="logo-link">
              <Image src="/images/logo.png" alt="Hanib Logo" width={100} height={40} className="logo-img" />
            </Link>
          </div>
          
          <form className="nav-center" onSubmit={handleSearch}>
            <div className="search-wrapper">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchTerm}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchTerm(val);
                    setShowDropdown(val.length > 0);
                    if (val) {
                      router.push(`/?search=${encodeURIComponent(val)}`);
                    } else {
                      router.push(`/`);
                    }
                  }}
                  onFocus={() => { if (searchTerm) setShowDropdown(true); }}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  className="search-input"
                />
              </div>
              
              {showDropdown && (
                <div className="search-dropdown">
                  {allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5).map(prod => (
                    <Link key={prod.id} href={`/product/${prod.id}`} className="dropdown-item">
                      <div className="dropdown-img">
                        {prod.image ? <Image src={prod.image} alt={prod.name} width={40} height={40} style={{objectFit: 'cover'}}/> : <span className="placeholder">{prod.name.charAt(0)}</span>}
                      </div>
                      <div className="dropdown-info">
                        <span className="dropdown-name">{prod.name}</span>
                        <span className="dropdown-price">₦{prod.price.toLocaleString()}</span>
                      </div>
                    </Link>
                  ))}
                  {allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                    <div className="dropdown-empty">No results found.</div>
                  )}
                </div>
              )}
            </div>
          </form>
          
          <div className="nav-actions">
            {user?.role !== 'owner' && (
              <button onClick={() => setIsCartOpen(true)} className="btn btn-outline cart-btn">
                <ShoppingCart size={18} />
                <span>Cart ({cartCount})</span>
              </button>
            )}
            {user && (
              <button onClick={logout} className="btn btn-outline logout-btn" title="Logout"><LogOut size={18}/></button>
            )}
          </div>
        </div>
      </header>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {user?.role !== 'owner' && (
        <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} setCart={setCart} />
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <Link href="/" className="bottom-nav-item">
          <Home size={28} />
        </Link>
        <button className="bottom-nav-item" onClick={() => document.querySelector('.search-input')?.focus()}>
          <Search size={28} />
        </button>
        {user?.role !== 'owner' && (
          <button className="bottom-nav-item" onClick={() => setIsCartOpen(true)}>
            <div className="cart-icon-wrapper">
              <ShoppingCart size={28} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
          </button>
        )}
        <Link href={user ? "/dashboard" : "/auth"} className="bottom-nav-item">
          <Settings size={28} />
        </Link>
      </nav>

      <style jsx>{`
        .navbar {
          height: 80px;
          display: flex;
          align-items: center;
          background: rgba(250, 250, 247, 0.8);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .nav-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .menu-btn {
          color: var(--foreground);
        }
        .logo-img {
          object-fit: contain;
        }
        .nav-center {
          display: flex;
          justify-content: center;
          padding: 0 1rem;
          flex: 0 1 500px;
        }
        .search-wrapper {
          position: relative;
          width: 100%;
          max-width: 500px;
        }
        .search-box {
          display: flex;
          align-items: center;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          padding: 0.5rem 1rem;
          width: 100%;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s ease;
        }
        .search-box:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--ring);
        }
        .search-icon {
          color: var(--muted-foreground);
          margin-right: 0.5rem;
        }
        .search-input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-family: var(--font-poppins);
          font-size: 0.875rem;
          color: var(--foreground);
        }
        .search-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          width: 100%;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          max-height: 400px;
          overflow-y: auto;
          z-index: 100;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          padding: 1rem 1.5rem;
          gap: 1.25rem;
          border-bottom: 1px solid var(--border);
          transition: background 0.2s;
        }
        .dropdown-item:hover {
          background: var(--muted);
        }
        .dropdown-img {
          width: 40px; height: 40px;
          background: var(--muted);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .placeholder {
          font-weight: 700;
          color: var(--muted-foreground);
        }
        .dropdown-info {
          display: flex;
          flex-direction: column;
        }
        .dropdown-name {
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.2rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 300px;
        }
        .dropdown-price {
          color: var(--primary);
          font-size: 0.75rem;
          font-weight: 700;
        }
        .dropdown-empty {
          padding: 1rem;
          text-align: center;
          color: var(--muted-foreground);
          font-size: 0.875rem;
        }
        .nav-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .cart-btn {
          gap: 0.5rem;
          border: none;
        }
        .cart-btn:hover {
          background: transparent;
          text-decoration: underline;
        }
        .logout-btn {
          border: none;
        }
        .logout-btn:hover {
          background: transparent;
          color: red;
        }

        /* Mobile Bottom Nav */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 64px;
          background: var(--card);
          border-top: 1px solid var(--border);
          z-index: 1000;
          box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
          padding-bottom: env(safe-area-inset-bottom);
          align-items: center;
          justify-content: space-around;
        }
        .bottom-nav-item {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          flex: 1;
          color: var(--muted-foreground);
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          margin: 0;
          padding: 0;
        }
        .bottom-nav-item:hover, .bottom-nav-item:active {
          color: var(--primary);
        }
        .cart-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cart-badge {
          position: absolute;
          top: -4px;
          right: -8px;
          background: red;
          color: white;
          border-radius: 50%;
          padding: 0.15rem 0.35rem;
          font-size: 0.65rem;
          font-weight: bold;
          line-height: 1;
        }

        @media(max-width: 768px) {
          .mobile-bottom-nav {
            display: flex;
          }
          .nav-actions .cart-btn {
            display: none;
          }
          .nav-center {
            padding: 0;
          }
          .search-input {
            width: 120px;
          }
        }
      `}</style>
    </>
  );
}

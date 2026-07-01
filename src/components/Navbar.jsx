'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, LogOut, Menu, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import CartModal from './CartModal';
import Sidebar from './Sidebar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');

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
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchTerm(val);
                  if (val) {
                    router.push(`/?search=${encodeURIComponent(val)}`);
                  } else {
                    router.push(`/`);
                  }
                }}
                className="search-input"
              />
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
        .search-box {
          display: flex;
          align-items: center;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          padding: 0.5rem 1rem;
          width: 100%;
          max-width: 500px;
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
      `}</style>
    </>
  );
}

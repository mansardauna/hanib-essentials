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
      <header className="h-20 flex items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-brand-100 shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-700 hover:text-brand-500 transition-colors">
              <Menu size={24} />
            </button>
            <Link href="/" className="flex flex-shrink-0 items-center gap-2">
              <Image src="/images/logo.png" alt="Hanib Logo" width={32} height={32} className="object-cover rounded-full" />
              <span className="font-bold text-slate-800 text-lg whitespace-nowrap md:hidden">Hanib Essentials</span>
            </Link>
          </div>
          
          <div className="hidden md:block w-8"></div> {/* Spacer for desktop so search isn't tight left */}
          
          <form className="hidden md:flex justify-center px-4 flex-1 max-w-lg relative" onSubmit={handleSearch}>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2 w-full shadow-sm focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-200 transition-all">
              <Search size={18} className="text-slate-400 mr-2" />
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
                className="bg-transparent border-none outline-none w-full text-sm text-slate-700"
              />
            </div>
            
            {showDropdown && (
              <div className="absolute top-full mt-2 left-4 right-4 bg-white border border-slate-200 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50">
                {allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5).map(prod => (
                  <Link key={prod.id} href={`/product/${prod.id}`} className="flex items-center px-6 py-4 gap-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center overflow-hidden shrink-0">
                      {prod.image ? <Image src={prod.image} alt={prod.name} width={40} height={40} className="object-cover"/> : <span className="font-bold text-slate-400">{prod.name.charAt(0)}</span>}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-semibold text-sm truncate text-slate-800">{prod.name}</span>
                      <span className="text-brand-600 text-xs font-bold">₦{prod.price.toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
                {allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                  <div className="p-4 text-center text-slate-500 text-sm">No results found.</div>
                )}
              </div>
            )}
          </form>
          
          <div className="flex items-center gap-4">
            {user?.role === 'owner' ? (
              <Link href="/dashboard" className="hidden md:inline-flex px-5 py-2 border border-brand-200 text-brand-600 rounded-full hover:bg-brand-50 font-medium transition-colors text-sm">Dashboard</Link>
            ) : (
              <button onClick={() => setIsCartOpen(true)} className="hidden md:inline-flex items-center gap-2 px-5 py-2 border border-slate-200 rounded-full hover:bg-slate-50 text-slate-700 font-medium transition-colors text-sm hover:border-brand-300">
                <ShoppingCart size={18} className="text-brand-500"/>
                <span>Cart ({cartCount})</span>
              </button>
            )}
            {user && (
              <>
                {user?.role !== 'owner' && <Link href="/settings" className="hidden md:inline-flex p-2 text-slate-600 hover:text-brand-500 hover:bg-slate-50 rounded-full transition-colors"><Settings size={20}/></Link>}
                <button onClick={logout} className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Logout"><LogOut size={20}/></button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <div className="md:hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
      {user?.role !== 'owner' && (
        <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} setCart={setCart} />
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-white border-t border-slate-200 z-[1000] shadow-[0_-4px_12px_rgba(0,0,0,0.05)] flex items-center justify-around pb-safe">
        <Link href="/" className="flex-1 h-full flex flex-col items-center justify-center text-slate-500 hover:text-brand-500 transition-colors">
          <Home size={24} />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </Link>
        <button className="flex-1 h-full flex flex-col items-center justify-center text-slate-500 hover:text-brand-500 transition-colors" onClick={() => {
          setIsSidebarOpen(true); // Open sidebar on mobile instead since search bar is hidden
        }}>
          <Search size={24} />
          <span className="text-[10px] mt-1 font-medium">Search</span>
        </button>
        {user?.role !== 'owner' && (
          <button className="flex-1 h-full flex flex-col items-center justify-center text-slate-500 hover:text-brand-500 transition-colors" onClick={() => setIsCartOpen(true)}>
            <div className="relative flex items-center justify-center">
              <ShoppingCart size={24} />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none">{cartCount}</span>}
            </div>
            <span className="text-[10px] mt-1 font-medium">Cart</span>
          </button>
        )}
        <Link href={user ? (user.role === 'owner' ? "/dashboard" : "/settings") : "/auth"} className="flex-1 h-full flex flex-col items-center justify-center text-slate-500 hover:text-brand-500 transition-colors">
          <Settings size={24} />
          <span className="text-[10px] mt-1 font-medium">{user?.role === 'owner' ? 'Admin' : 'Settings'}</span>
        </Link>
      </nav>
    </>
  );
}

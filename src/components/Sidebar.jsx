'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { X, Home, ShoppingBag, LayoutDashboard, User as UserIcon, Heart, HelpCircle, Settings, DollarSign } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm" 
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar Panel */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen w-64 lg:w-72 bg-white shadow-2xl md:shadow-none md:border-r md:border-slate-100 z-50 transform transition-transform duration-300 ease-in-out flex flex-col shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex justify-between items-center px-6 py-6 border-b border-slate-100 h-20 shrink-0">
          <Link href="/" onClick={onClose} className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Hanib Logo" width={40} height={40} className="object-cover rounded-full shadow-sm" />
            <span className="text-lg font-black text-slate-800 tracking-wider">HANIB</span>
          </Link>
          <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2 p-6 overflow-y-auto">
          <Link href="/" onClick={onClose} className={`flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase rounded-xl transition-colors ${isActive('/') ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'}`}>
            <Home size={20} className="shrink-0" />
            <span>Home</span>
          </Link>
          
          {user?.role === 'customer' && (
            <>
              <Link href="/track-order" onClick={onClose} className={`flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase rounded-xl transition-colors ${isActive('/track-order') ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'}`}>
                <ShoppingBag size={20} className="shrink-0" />
                <span>My Orders</span>
              </Link>
              <Link href="/wishlist" onClick={onClose} className={`flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase rounded-xl transition-colors ${isActive('/wishlist') ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'}`}>
                <Heart size={20} className="shrink-0" />
                <span>Wishlist</span>
              </Link>
            </>
          )}
          
          {/* Dashboard links specifically for Store Owners */}
          {user?.role === 'owner' && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
              <span className="px-4 text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">Store Dashboard</span>
              
              <Link href="/dashboard" onClick={onClose} className={`flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase rounded-xl transition-colors ${isActive('/dashboard') ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'}`}>
                <LayoutDashboard size={20} className="shrink-0" />
                <span>Overview</span>
              </Link>
              <Link href="/dashboard/products" onClick={onClose} className={`flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase rounded-xl transition-colors ${isActive('/dashboard/products') ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'}`}>
                <ShoppingBag size={20} className="shrink-0" />
                <span>Products & Cats</span>
              </Link>
              <Link href="/dashboard/orders" onClick={onClose} className={`flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase rounded-xl transition-colors ${isActive('/dashboard/orders') ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'}`}>
                <ShoppingBag size={20} className="shrink-0" />
                <span>Orders</span>
              </Link>
              <Link href="/dashboard/finances" onClick={onClose} className={`flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase rounded-xl transition-colors ${isActive('/dashboard/finances') ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'}`}>
                <DollarSign size={20} className="shrink-0" />
                <span>Finances</span>
              </Link>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/help" onClick={onClose} className={`flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase rounded-xl transition-colors ${isActive('/help') ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'}`}>
              <HelpCircle size={20} className="shrink-0" />
              <span>Help Center</span>
            </Link>
            <Link href="/settings" onClick={onClose} className={`flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase rounded-xl transition-colors ${isActive('/settings') ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'}`}>
              <Settings size={20} className="shrink-0" />
              <span>Settings</span>
            </Link>
          </div>
          
          <div className="mt-auto pt-6">
            {user ? (
              <div className="flex flex-col px-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Logged in as</span>
                <span className="text-sm font-black text-slate-800">{user.username}</span>
              </div>
            ) : (
              <Link href="/auth" onClick={onClose} className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-800 text-white rounded-xl font-bold shadow-sm hover:bg-slate-900 transition-colors">
                <UserIcon size={20} className="shrink-0" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}

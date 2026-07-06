'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { X, Home, ShoppingBag, LayoutDashboard, User as UserIcon, Heart, HelpCircle, Settings } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm" 
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 left-0 h-screen w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center px-6 py-8 border-b border-slate-100">
          <h2 className="text-xl font-bold tracking-widest text-slate-800 uppercase">Menu</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2 p-6 overflow-y-auto">
          <Link href="/" onClick={onClose} className="flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase text-slate-600 rounded-xl hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <Home size={20} className="shrink-0" />
            <span>Home</span>
          </Link>
          
          {user?.role === 'customer' && (
            <>
              <Link href="/track-order" onClick={onClose} className="flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase text-slate-600 rounded-xl hover:text-brand-600 hover:bg-brand-50 transition-colors">
                <ShoppingBag size={20} className="shrink-0" />
                <span>My Orders</span>
              </Link>
              <Link href="/wishlist" onClick={onClose} className="flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase text-slate-600 rounded-xl hover:text-brand-600 hover:bg-brand-50 transition-colors">
                <Heart size={20} className="shrink-0" />
                <span>Wishlist</span>
              </Link>
            </>
          )}
          
          {user?.role === 'owner' && (
            <Link href="/dashboard" onClick={onClose} className="flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase text-slate-600 rounded-xl hover:text-brand-600 hover:bg-brand-50 transition-colors">
              <LayoutDashboard size={20} className="shrink-0" />
              <span>Dashboard</span>
            </Link>
          )}
          
          <Link href="/help" onClick={onClose} className="flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase text-slate-600 rounded-xl hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <HelpCircle size={20} className="shrink-0" />
            <span>Help Center</span>
          </Link>
          <Link href="/settings" onClick={onClose} className="flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase text-slate-600 rounded-xl hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <Settings size={20} className="shrink-0" />
            <span>Settings</span>
          </Link>
          
          <div className="mt-auto pt-6 border-t border-slate-100">
            {user ? (
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Logged in as</span>
                <span className="text-sm font-semibold text-slate-800">{user.username}</span>
              </div>
            ) : (
              <Link href="/auth" onClick={onClose} className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-800 text-white rounded-xl font-semibold shadow-sm hover:bg-slate-900 transition-colors">
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

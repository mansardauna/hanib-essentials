'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, DollarSign } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'owner')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center font-medium text-slate-500">Loading dashboard...</div>;

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-slate-50">
      
      {/* Dashboard Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col flex-shrink-0">
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-xl font-bold tracking-widest text-slate-800 uppercase">Store Owner</h2>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2 p-6">
          <Link href="/dashboard" className="flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase text-slate-600 rounded-xl hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <LayoutDashboard size={20} className="shrink-0" />
            <span>Overview</span>
          </Link>
          <Link href="/dashboard/products" className="flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase text-slate-600 rounded-xl hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <ShoppingBag size={20} className="shrink-0" />
            <span>Products</span>
          </Link>
          <Link href="/dashboard/orders" className="flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase text-slate-600 rounded-xl hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <ShoppingBag size={20} className="shrink-0" />
            <span>Orders</span>
          </Link>
          <Link href="/dashboard/finances" className="flex items-center gap-4 px-4 py-3 font-semibold text-sm uppercase text-slate-600 rounded-xl hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <DollarSign size={20} className="shrink-0" />
            <span>Finances</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      
    </div>
  );
}

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

  if (loading || !user) return <div className="container" style={{padding: '4rem 1rem'}}>Loading...</div>;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Store Owner</h2>
        </div>
        <nav className="sidebar-nav">
          <Link href="/dashboard"><LayoutDashboard size={20}/> Overview</Link>
          <Link href="/dashboard/products"><ShoppingBag size={20}/> Products</Link>
          <Link href="/dashboard/orders"><ShoppingBag size={20}/> Orders</Link>
          <Link href="/dashboard/finances"><DollarSign size={20}/> Finances</Link>
        </nav>
      </aside>
      <main className="dashboard-main">
        {children}
      </main>
      
      <style jsx>{`
        .dashboard-container {
          display: flex;
          min-height: calc(100vh - 80px);
        }
        .sidebar {
          width: 250px;
          background: var(--card);
          border-right: 1px solid var(--border);
          padding: 2rem 1rem;
        }
        .sidebar-header {
          margin-bottom: 2rem;
          padding-left: 1rem;
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .sidebar-nav a {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          color: var(--muted-foreground);
          font-weight: 500;
          transition: all 0.2s;
        }
        .sidebar-nav a:hover {
          background: var(--muted);
          color: var(--primary);
        }
        .dashboard-main {
          flex: 1;
          padding: 2rem;
          background: var(--background);
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { X, Home, ShoppingBag, LayoutDashboard, User as UserIcon } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>MENU</h2>
          <button onClick={onClose} className="btn-close"><X /></button>
        </div>
        <nav className="sidebar-nav">
          <Link href="/" onClick={onClose}><Home size={20}/> Home</Link>
          
          {user?.role === 'customer' && (
            <Link href="/track-order" onClick={onClose}><ShoppingBag size={20}/> My Orders</Link>
          )}
          
          {user?.role === 'owner' && (
            <Link href="/dashboard" onClick={onClose}><LayoutDashboard size={20}/> Dashboard</Link>
          )}
          
          <div style={{marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem'}}>
            {user ? (
              <div className="user-info">
                <span>Logged in as <strong>{user.username}</strong></span>
              </div>
            ) : (
              <Link href="/auth" onClick={onClose} className="btn btn-outline" style={{width: '100%', display: 'flex'}}><UserIcon size={20}/> Login</Link>
            )}
          </div>
        </nav>
      </aside>

      <style jsx>{`
        .sidebar-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 90;
        }
        .sidebar {
          position: fixed;
          top: 0; left: -320px;
          width: 320px;
          height: 100vh;
          background: var(--card);
          box-shadow: var(--shadow-md);
          z-index: 100;
          transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }
        .sidebar.open {
          left: 0;
        }
        .sidebar-header {
          padding: 2rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
        }
        .sidebar-header h2 {
          margin: 0;
          font-size: 1.25rem;
          letter-spacing: 2px;
        }
        .btn-close {
          color: var(--foreground);
        }
        .sidebar-nav {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          flex: 1;
        }
        .sidebar-nav a {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          padding: 0.5rem 0;
          transition: color 0.2s;
        }
        .sidebar-nav a:hover {
          color: var(--muted-foreground);
        }
        .user-info {
          font-size: 0.875rem;
          color: var(--muted-foreground);
        }
      `}</style>
    </>
  );
}

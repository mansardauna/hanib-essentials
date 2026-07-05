'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, TrendingUp, Package, Users } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function DashboardOverview() {
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    supabase.from('orders').select('*').then(({ data }) => { if (data) setOrders(data); });
    supabase.from('expenses').select('*').then(({ data }) => { if (data) setExpenses(data); });
    supabase.from('products').select('*').then(({ data }) => { if (data) setProducts(data); });
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const recentOrders = [...orders].reverse().slice(0, 5);
  const outOfStock = products.filter(p => p.stock <= 0);

  return (
    <div>
      <h1 style={{marginBottom: '2rem'}}>Dashboard Overview</h1>
      
      {outOfStock.length > 0 && (
        <div className="alert">
          <TrendingUp size={24} style={{marginRight: '0.5rem'}} />
          <div>
            <strong>Alert:</strong> You have {outOfStock.length} item(s) out of stock! 
            ({outOfStock.map(p => p.name).join(', ')})
          </div>
        </div>
      )}
      
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon"><DollarSign size={24} color="var(--primary)" /></div>
          <div className="stat-info">
            <p>Total Revenue</p>
            <h3>₦{totalRevenue.toLocaleString()}</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon"><TrendingUp size={24} color="var(--secondary)" /></div>
          <div className="stat-info">
            <p>Total Expenses</p>
            <h3>₦{totalExpenses.toLocaleString()}</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon"><ShoppingBag size={24} color="var(--foreground)" /></div>
          <div className="stat-info">
            <p>Total Orders</p>
            <h3>{orders.length}</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon"><TrendingUp size={24} color={netProfit >= 0 ? "var(--primary)" : "var(--destructive)"} /></div>
          <div className="stat-info">
            <p>Net Profit</p>
            <h3 style={{color: netProfit >= 0 ? 'inherit' : 'var(--destructive)'}}>₦{netProfit.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop: '2rem', padding: '1.5rem'}}>
        <h2>Recent Orders</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{new Date(order.date).toLocaleDateString()}</td>
                <td>₦{order.total.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                </td>
                <td>
                  <Link href={`/invoice/${order.id}`} className="btn btn-outline" style={{padding: '0.25rem 0.75rem', fontSize: '0.75rem'}}>
                    View Invoice
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }
        .stat-card {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
          background: var(--muted);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-info p {
          color: var(--muted-foreground);
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }
        .stat-info h3 {
          font-size: 1.5rem;
          margin: 0;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }
        .table th, .table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        .table th {
          color: var(--muted-foreground);
          font-weight: 500;
        }
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
        }
        .status-badge.processing { background: #fef3c7; color: #d97706; }
        .status-badge.delivered { background: #dbeafe; color: #2563eb; }
        .status-badge.received { background: #d1fae5; color: #059669; }
        .alert {
          background: var(--destructive);
          color: var(--destructive-foreground);
          padding: 1rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          border-left: 4px solid red;
        }
      `}</style>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Package, Truck, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TrackOrder() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      fetch(`/api/orders?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setOrders(data))
        .catch(console.error);
    }
  }, [user, loading, router]);

  const markReceived = async (orderId) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: 'Received' })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || !user) return <div className="container" style={{padding: '4rem 1rem'}}>Loading...</div>;

  return (
    <main className="container" style={{padding: '3rem 1rem'}}>
      <div style={{marginBottom: '2rem'}}>
        <h1>Track Your Orders</h1>
        <p style={{color: 'var(--muted-foreground)'}}>Monitor the status of your deliveries</p>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{padding: '3rem', textAlign: 'center'}}>
          <Package size={48} color="var(--muted-foreground)" style={{margin: '0 auto 1rem'}} />
          <h3>No Orders Found</h3>
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          {orders.map(order => (
            <div key={order.id} className="card order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order.id}</h3>
                  <span className="date">{new Date(order.date).toLocaleDateString()}</span>
                </div>
                <div className={`status-badge ${order.status.toLowerCase()}`}>
                  {order.status}
                </div>
              </div>
              
              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <span>{item.quantity}x {item.name || `Product ${item.productId}`}</span>
                  </div>
                ))}
              </div>
              
              <div className="order-footer">
                <span className="total">Total: ₦{order.total.toLocaleString()}</span>
                <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                  <button onClick={() => router.push(`/receipt/${order.id}`)} className="btn btn-outline" style={{padding: '0.5rem 1rem'}}>
                    View Receipt
                  </button>
                  {order.status === 'Delivered' && (
                    <button onClick={() => markReceived(order.id)} className="btn btn-primary">
                      <CheckCircle size={18} style={{marginRight: '0.5rem'}} /> Confirm Receipt
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .order-card {
          padding: 1.5rem;
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }
        .order-header h3 {
          margin: 0 0 0.25rem 0;
        }
        .date {
          color: var(--muted-foreground);
          font-size: 0.875rem;
        }
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 600;
        }
        .status-badge.processing { background: #fef3c7; color: #d97706; }
        .status-badge.delivered { background: #dbeafe; color: #2563eb; }
        .status-badge.received { background: #d1fae5; color: #059669; }
        
        .order-items {
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .order-item {
          color: var(--card-foreground);
        }
        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px dashed var(--border);
        }
        .total {
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--primary);
        }
      `}</style>
    </main>
  );
}

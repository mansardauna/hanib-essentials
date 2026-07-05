'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Truck, CheckCircle, Clock } from 'lucide-react';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    supabase.from('orders').select('*').order('date', { ascending: false }).then(({ data }) => { if (data) setOrders(data); });
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select();
      if (!error && data) {
        setOrders(prev => prev.map(o => o.id === id ? data[0] : o));
        
        // Send status update email
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: 'customer@hanib.demo', // Replace with dynamic customer email if available
              subject: `Order Update - ${id}`,
              html: `<h1>Order Status Update</h1>
                     <p>Your order <strong>${id}</strong> has been updated to: <strong>${status}</strong></p>`
            })
          });
        } catch (e) {
          console.error('Email sending failed', e);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 style={{marginBottom: '2rem'}}>Manage Orders</h1>
      <div className="card" style={{padding: '1.5rem'}}>
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.userId}</td>
                <td>{new Date(order.date).toLocaleDateString()}</td>
                <td>₦{order.total.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                </td>
                <td>
                  {order.status === 'Processing' && (
                    <button onClick={() => updateStatus(order.id, 'Delivered')} className="btn btn-primary btn-sm">
                      <Truck size={14} style={{marginRight: '0.25rem'}}/> Mark Delivered
                    </button>
                  )}
                  {order.status === 'Delivered' && (
                    <span style={{color: 'var(--muted-foreground)', fontSize: '0.875rem'}}>Waiting for customer...</span>
                  )}
                  {order.status === 'Received' && (
                    <span style={{color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                      <CheckCircle size={14}/> Completed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .table {
          width: 100%;
          border-collapse: collapse;
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
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}

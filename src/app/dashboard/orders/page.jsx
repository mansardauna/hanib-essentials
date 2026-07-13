'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Truck, CheckCircle, Clock, DollarSign } from 'lucide-react';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    supabase.from('orders').select('*').order('date', { ascending: false }).then(({ data }) => { if (data) setOrders(data); });
  }, []);

  const updateStatus = async (id, status, userId) => {
    try {
      const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select();
      if (!error && data) {
        setOrders(prev => prev.map(o => o.id === id ? data[0] : o));
        
        if (userId) {
          await supabase.from('notifications').insert([{
            id: `notif_${Date.now()}_u`,
            userId: userId,
            title: 'Order Status Updated',
            message: `Your order ${id} has been updated to: ${status}.`,
            isRead: false
          }]);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSetQuote = async (order) => {
    const quote = prompt(`Enter the delivery fee for this order to ${order.location || 'Outside Kaduna'} (₦):`);
    if (quote === null || quote === '') return;
    const fee = parseInt(quote);
    if (isNaN(fee)) return alert('Invalid amount');

    const newTotal = order.subtotal + fee;

    try {
      const { data, error } = await supabase.from('orders')
        .update({ deliveryFee: fee, total: newTotal, status: 'Pending Payment' })
        .eq('id', order.id)
        .select();

      if (!error && data) {
        setOrders(prev => prev.map(o => o.id === order.id ? data[0] : o));
        
        if (order.userId) {
          await supabase.from('notifications').insert([{
            id: `notif_${Date.now()}_q`,
            userId: order.userId,
            title: 'Delivery Quote Ready',
            message: `Your delivery quote for order ${order.id} is ready. Please proceed to payment.`,
            isRead: false
          }]);
        }
        
        alert('Delivery quote sent successfully! The customer can now pay for the order.');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to set quote');
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
              <th>Date</th>
              <th>Location</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{new Date(order.date).toLocaleDateString()}</td>
                <td>
                  {order.location === 'Outside Kaduna / Other' ? (
                    <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold">Outside Kaduna</span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs font-bold">{order.location || 'Within Kaduna'}</span>
                  )}
                </td>
                <td>
                  {order.status === 'Awaiting Quote' ? (
                    <span className="text-slate-400 italic font-medium">Pending Quote</span>
                  ) : (
                    `₦${order.total.toLocaleString()}`
                  )}
                </td>
                <td>
                  <span className={`status-badge ${order.status.replace(' ', '-').toLowerCase()}`}>{order.status}</span>
                </td>
                <td>
                  {order.status === 'Awaiting Quote' && (
                    <button onClick={() => handleSetQuote(order)} className="btn btn-primary btn-sm flex items-center gap-1">
                      <DollarSign size={14} /> Set Quote
                    </button>
                  )}
                  {order.status === 'Pending Payment' && (
                    <span style={{color: 'var(--muted-foreground)', fontSize: '0.875rem'}}>Waiting for payment...</span>
                  )}
                  {order.status === 'Processing' && (
                    <button onClick={() => updateStatus(order.id, 'Delivered', order.userId)} className="btn btn-primary btn-sm flex items-center gap-1">
                      <Truck size={14} /> Mark Delivered
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
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--border); }
        .table th { color: var(--muted-foreground); font-weight: 500; }
        .status-badge { padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; }
        .status-badge.processing { background: #fef3c7; color: #d97706; }
        .status-badge.delivered { background: #dbeafe; color: #2563eb; }
        .status-badge.received { background: #d1fae5; color: #059669; }
        .status-badge.awaiting-quote { background: #fce7f3; color: #be185d; }
        .status-badge.pending-payment { background: #e0e7ff; color: #4338ca; }
        .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
      `}</style>
    </div>
  );
}

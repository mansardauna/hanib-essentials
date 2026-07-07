'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Package, Truck, CheckCircle, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TrackOrder() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const router = useRouter();

  // Payment states
  const [showOPayModal, setShowOPayModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [orderToPay, setOrderToPay] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      supabase.from('orders').select('*').eq('userId', user.id).order('date', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) setOrders(data);
          setLoadingOrders(false);
        });
    }
  }, [user, loading, router]);

  const markReceived = async (orderId) => {
    try {
      const { data, error } = await supabase.from('orders').update({ status: 'Received' }).eq('id', orderId).select();
      if (!error && data) {
        setOrders(prev => prev.map(o => o.id === orderId ? data[0] : o));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePayNow = (order) => {
    setOrderToPay(order);
    setShowOPayModal(true);
    setPaymentStatus('processing');
    
    // Simulate OPay payment
    setTimeout(() => {
      setPaymentStatus('success');
      setTimeout(async () => {
        // Update order to Processing
        const { data, error } = await supabase.from('orders').update({ status: 'Processing' }).eq('id', order.id).select();
        if (!error && data) {
          setOrders(prev => prev.map(o => o.id === order.id ? data[0] : o));
        }
        setShowOPayModal(false);
        setOrderToPay(null);
        setPaymentStatus('idle');
      }, 1500);
    }, 3000);
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
                <div className={`status-badge ${order.status.replace(' ', '-').toLowerCase()}`}>
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
                <div>
                  <span className="total">Total: ₦{order.total.toLocaleString()}</span>
                  {order.location === 'Outside Kaduna' && (
                    <p style={{fontSize: '0.8rem', color: 'var(--muted-foreground)', margin: '4px 0 0 0'}}>
                      Delivery to {order.location} (Fee: ₦{order.deliveryFee.toLocaleString()})
                    </p>
                  )}
                </div>
                <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                  <button onClick={() => router.push(`/receipt/${order.id}`)} className="btn btn-outline" style={{padding: '0.5rem 1rem'}}>
                    View Receipt
                  </button>
                  {order.status === 'Pending Payment' && (
                    <button onClick={() => handlePayNow(order)} className="btn btn-primary" style={{backgroundColor: '#17B169', color: 'white', border: 'none'}}>
                      <CreditCard size={18} style={{marginRight: '0.5rem'}} /> Pay Now
                    </button>
                  )}
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

      {/* OPay Modal */}
      {showOPayModal && orderToPay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl transform transition-all">
            <h2 className="text-[#17B169] text-4xl font-black tracking-tighter mb-8">OPay</h2>
            
            {paymentStatus === 'processing' ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-[#17B169] rounded-full animate-spin"></div>
                <p className="font-semibold text-slate-700">Processing Payment securely...</p>
                <span className="text-3xl font-bold text-slate-800 mt-2">₦{orderToPay.total.toLocaleString()}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-[#17B169] text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-md">
                  ✓
                </div>
                <p className="text-xl font-bold text-slate-800 mt-2">Payment Successful!</p>
                <span className="text-sm font-medium text-slate-500">Updating your order...</span>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .order-card { padding: 1.5rem; }
        .order-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
        .order-header h3 { margin: 0 0 0.25rem 0; }
        .date { color: var(--muted-foreground); font-size: 0.875rem; }
        .status-badge { padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.875rem; font-weight: 600; }
        .status-badge.processing { background: #fef3c7; color: #d97706; }
        .status-badge.delivered { background: #dbeafe; color: #2563eb; }
        .status-badge.received { background: #d1fae5; color: #059669; }
        .status-badge.awaiting-quote { background: #fce7f3; color: #be185d; }
        .status-badge.pending-payment { background: #e0e7ff; color: #4338ca; }
        
        .order-items { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .order-item { color: var(--card-foreground); }
        .order-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px dashed var(--border); }
        .total { font-weight: 700; font-size: 1.25rem; color: var(--primary); }
      `}</style>
    </main>
  );
}

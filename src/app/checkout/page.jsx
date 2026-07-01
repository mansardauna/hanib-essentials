'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { user, updateProfile, loading } = useAuth();
  const router = useRouter();
  
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [cart, setCart] = useState([]);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user) {
      setAddress(user.address || '');
      setPhone(user.phone || '');
    }
    
    const savedCart = localStorage.getItem('hanib_cart_v2');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, [user, loading, router]);

  const placeOrder = async () => {
    if (!address || !phone) return alert('Please complete your profile details');
    
    if (!user.address || !user.phone) {
      await updateProfile(address, phone);
    }
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalDeliveryFee = cart.reduce((sum, item) => sum + ((item.deliveryFee || 0) * item.quantity), 0);
    const total = subtotal + totalDeliveryFee;
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          items: cart.map(item => ({ productId: item.id, quantity: item.quantity, name: item.name, price: item.price })),
          subtotal,
          deliveryFee: totalDeliveryFee,
          total
        })
      });
      if (res.ok) {
        localStorage.removeItem('hanib_cart_v2');
        alert("Order placed successfully!");
        router.push('/track-order');
      } else {
        const err = await res.json();
        alert(err.error || 'Checkout failed');
      }
    } catch (error) {
      console.error(error);
      alert("Checkout failed");
    }
  };

  if (loading || !user) return <div className="container">Loading...</div>;

  return (
    <main className="container checkout-page">
      <div className="checkout-grid">
        <div className="card checkout-form">
          <h2>Shipping Information</h2>
          {(!user.address || !user.phone) && (
            <p className="notice">Please provide your details for this first order.</p>
          )}
          <div className="mui-form-group">
            <input 
              type="text" 
              className="mui-input" 
              placeholder=" " 
              value={address}
              onChange={e => setAddress(e.target.value)}
              required 
            />
            <label className="mui-label">Delivery Address</label>
          </div>
          <div className="mui-form-group">
            <input 
              type="text" 
              className="mui-input" 
              placeholder=" " 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required 
            />
            <label className="mui-label">Phone Number</label>
          </div>
        </div>
        
        <div className="card checkout-summary">
          <h2>Order Summary</h2>
          <div className="summary-list">
            {cart.map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.quantity}x {item.name}</span>
                <span>₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="summary-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>₦{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
            </div>
            <div className="total-row">
              <span>Delivery Fees:</span>
              <span>₦{cart.reduce((sum, item) => sum + ((item.deliveryFee || 0) * item.quantity), 0).toLocaleString()}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total:</span>
              <span>₦{(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + cart.reduce((sum, item) => sum + ((item.deliveryFee || 0) * item.quantity), 0)).toLocaleString()}</span>
            </div>
          </div>
          <button onClick={placeOrder} className="btn btn-primary w-full">Confirm Order</button>
        </div>
      </div>
      
      <style jsx>{`
        .checkout-page {
          padding: 3rem 1rem;
        }
        .checkout-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }
        @media(max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr; }
        }
        .checkout-form, .checkout-summary {
          padding: 2rem;
        }
        .checkout-form h2, .checkout-summary h2 {
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid var(--border);
          padding-bottom: 0.5rem;
        }
        .notice {
          color: var(--muted-foreground);
          margin-bottom: 1.5rem;
          font-style: italic;
        }
        .summary-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1.5rem;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }
        .summary-totals {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
        }
        .grand-total {
          font-weight: 700;
          font-size: 1.25rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }
        .w-full { width: 100%; }
      `}</style>
    </main>
  );
}

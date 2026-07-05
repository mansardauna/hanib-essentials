'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function CheckoutPage() {
  const { user, updateProfile, loading } = useAuth();
  const router = useRouter();
  
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [cart, setCart] = useState([]);
  
  const [showOPayModal, setShowOPayModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success
  
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

  const handleOPayClick = () => {
    if (!address || !phone) return alert('Please complete your profile details');
    setShowOPayModal(true);
    setPaymentStatus('processing');
    
    // Simulate OPay network request
    setTimeout(() => {
      setPaymentStatus('success');
      setTimeout(() => {
        placeOrder();
      }, 1500);
    }, 3000);
  };

  const placeOrder = async () => {
    if (!user.address || !user.phone) {
      await updateProfile(address, phone);
    }
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalDeliveryFee = cart.reduce((sum, item) => sum + ((item.deliveryFee || 0) * item.quantity), 0);
    const total = subtotal + totalDeliveryFee;
    
    try {
      const newOrder = {
        id: `o${Date.now()}`,
        userId: user.id,
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity, name: item.name, price: item.price })),
        subtotal,
        deliveryFee: totalDeliveryFee,
        total,
        status: "Processing"
      };

      const { data, error } = await supabase.from('orders').insert([newOrder]).select();

      if (!error && data) {
        localStorage.removeItem('hanib_cart_v2');
        
        // Send order confirmation email
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: user.email,
              subject: `Order Confirmation - ${newOrder.id}`,
              html: `<h1>Thank you for your order!</h1>
                     <p>Your order <strong>${newOrder.id}</strong> has been received and is currently processing.</p>
                     <p>Total: ₦${total.toLocaleString()}</p>
                     <p><a href="http://localhost:3000/receipt/${newOrder.id}">View your receipt and QR Code</a></p>`
            })
          });
        } catch (e) {
          console.error('Email sending failed', e);
        }

        setShowOPayModal(false);
        router.push('/track-order');
      } else {
        alert(error?.message || 'Checkout failed');
        setShowOPayModal(false);
      }
    } catch (error) {
      console.error(error);
      alert("Checkout failed");
      setShowOPayModal(false);
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
          <button onClick={handleOPayClick} className="btn opay-btn w-full">Pay with OPay</button>
        </div>
      </div>
      
      {showOPayModal && (
        <div className="opay-overlay">
          <div className="opay-modal card">
            <h2 className="opay-logo">OPay</h2>
            {paymentStatus === 'processing' ? (
              <div className="processing">
                <div className="spinner"></div>
                <p>Processing Payment securely...</p>
                <span className="opay-amount">₦{(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + cart.reduce((sum, item) => sum + ((item.deliveryFee || 0) * item.quantity), 0)).toLocaleString()}</span>
              </div>
            ) : (
              <div className="success">
                <div className="checkmark">✔</div>
                <p>Payment Successful!</p>
                <span style={{fontSize: '0.875rem', color: 'var(--muted-foreground)'}}>Redirecting to your orders...</span>
              </div>
            )}
          </div>
        </div>
      )}
      
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
        
        .opay-btn {
          background: #17B169; /* OPay Green */
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          padding: 1rem;
          border: none;
        }
        .opay-btn:hover {
          background: #128e54;
        }
        .opay-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .opay-modal {
          background: #fff;
          width: 90%;
          max-width: 400px;
          padding: 3rem 2rem;
          text-align: center;
          border-radius: var(--radius-lg);
          color: #000;
        }
        .opay-logo {
          color: #17B169;
          font-size: 2.5rem;
          margin-bottom: 2rem;
          font-weight: 900;
          letter-spacing: -1px;
        }
        .processing, .success {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .spinner {
          width: 40px; height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #17B169;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .opay-amount {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1rem;
        }
        .checkmark {
          width: 60px; height: 60px;
          background: #17B169;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        .success p {
          font-size: 1.25rem;
          font-weight: 700;
        }
      `}</style>
    </main>
  );
}

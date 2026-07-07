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
  const [location, setLocation] = useState('Within Kaduna'); // 'Within Kaduna' or 'Outside Kaduna'
  const [cart, setCart] = useState([]);
  
  const [showOPayModal, setShowOPayModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success
  const [isPlacingQuoteOrder, setIsPlacingQuoteOrder] = useState(false);
  
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
    if (!address || !phone) return alert('Please provide your Delivery Address and Phone Number.');
    setShowOPayModal(true);
    setPaymentStatus('processing');
    
    // Simulate OPay network request
    setTimeout(() => {
      setPaymentStatus('success');
      setTimeout(() => {
        placeOrder(true);
      }, 1500);
    }, 3000);
  };

  const handleRequestQuoteClick = async () => {
    if (!address || !phone) return alert('Please provide your Delivery Address and Phone Number.');
    setIsPlacingQuoteOrder(true);
    await placeOrder(false);
    setIsPlacingQuoteOrder(false);
  };

  const placeOrder = async (isPaid) => {
    if (!user.address || !user.phone) {
      await updateProfile(address, phone);
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // If outside Kaduna, delivery fee is 0 initially (pending quote). Otherwise, sum of product delivery fees.
    const totalDeliveryFee = location === 'Within Kaduna' 
      ? cart.reduce((sum, item) => sum + ((item.deliveryFee || 0) * item.quantity), 0) 
      : 0;
    const total = subtotal + totalDeliveryFee;
    
    try {
      const newOrder = {
        id: `o${Date.now()}`,
        userId: user.id,
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity, name: item.name, price: item.price })),
        subtotal,
        deliveryFee: totalDeliveryFee,
        total,
        location,
        status: isPaid ? "Processing" : "Awaiting Quote"
      };

      const { data, error } = await supabase.from('orders').insert([newOrder]).select();

      if (!error && data) {
        localStorage.removeItem('hanib_cart_v2');
        
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: user.email,
              subject: `Order Confirmation - ${newOrder.id}`,
              html: `<h1>Thank you for your order!</h1>
                     <p>Your order <strong>${newOrder.id}</strong> has been received.</p>
                     ${isPaid 
                       ? `<p>It is currently processing. Total paid: ₦${total.toLocaleString()}</p>` 
                       : `<p>We will calculate your delivery fee based on your location outside Kaduna and update the order shortly. You can then complete the payment.</p>`
                     }
                     <p><a href="https://hanib-essentials.vercel.app/receipt/${newOrder.id}">View your receipt</a></p>`
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

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center font-medium text-slate-500">Loading checkout...</div>;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDeliveryFee = location === 'Within Kaduna' 
    ? cart.reduce((sum, item) => sum + ((item.deliveryFee || 0) * item.quantity), 0)
    : 0;
  const grandTotal = subtotal + totalDeliveryFee;

  return (
    <main className="w-11/12 max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Shipping Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-100">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6 uppercase tracking-widest border-b border-slate-100 pb-4">Shipping Information</h2>
            
            {(!user.address || !user.phone) && (
              <div className="p-4 bg-brand-50 text-brand-700 text-sm font-medium rounded-xl border border-brand-100 mb-6">
                Please provide your details for this first order.
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Delivery Location</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all font-medium text-slate-800"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                >
                  <option value="Within Kaduna">Within Kaduna State</option>
                  <option value="Outside Kaduna">Outside Kaduna State</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  {location === 'Within Kaduna' 
                    ? "Standard local delivery rates apply to your order."
                    : "For orders outside Kaduna, we will calculate your delivery fee based on distance. You can pay after we update your order."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Delivery Address</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all font-medium text-slate-800"
                  placeholder="E.g., 123 Main Street, City, State" 
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all font-medium text-slate-800"
                  placeholder="E.g., +234 800 000 0000" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required 
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-100 sticky top-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-6 uppercase tracking-widest border-b border-slate-100 pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm font-medium text-slate-700">
                  <span className="flex-1 truncate pr-4">{item.quantity}x {item.name}</span>
                  <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              {cart.length === 0 && (
                <p className="text-slate-500 italic text-sm">Your cart is empty.</p>
              )}
            </div>
            
            <div className="space-y-3 pt-4 border-t border-slate-100 text-sm font-medium text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fees:</span>
                {location === 'Within Kaduna' ? (
                  <span>₦{totalDeliveryFee.toLocaleString()}</span>
                ) : (
                  <span className="text-brand-600 italic">Pending Quote</span>
                )}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
                <span className="text-lg font-semibold text-slate-800">Total:</span>
                {location === 'Within Kaduna' ? (
                  <span className="text-2xl font-bold text-brand-600">₦{grandTotal.toLocaleString()}</span>
                ) : (
                  <span className="text-xl font-bold text-slate-400">To be decided</span>
                )}
              </div>
            </div>
            
            {location === 'Within Kaduna' ? (
              <button 
                onClick={handleOPayClick} 
                disabled={cart.length === 0}
                className="w-full mt-8 py-4 bg-[#17B169] hover:bg-[#128e54] text-white font-bold rounded-2xl shadow-sm transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pay with OPay
              </button>
            ) : (
              <button 
                onClick={handleRequestQuoteClick} 
                disabled={cart.length === 0 || isPlacingQuoteOrder}
                className="w-full mt-8 py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl shadow-sm transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlacingQuoteOrder ? 'Placing Order...' : 'Request Delivery Quote'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* OPay Modal */}
      {showOPayModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl transform transition-all">
            <h2 className="text-[#17B169] text-4xl font-black tracking-tighter mb-8">OPay</h2>
            
            {paymentStatus === 'processing' ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-[#17B169] rounded-full animate-spin"></div>
                <p className="font-semibold text-slate-700">Processing Payment securely...</p>
                <span className="text-3xl font-bold text-slate-800 mt-2">₦{grandTotal.toLocaleString()}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-[#17B169] text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-md">
                  ✓
                </div>
                <p className="text-xl font-bold text-slate-800 mt-2">Payment Successful!</p>
                <span className="text-sm font-medium text-slate-500">Redirecting to your orders...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

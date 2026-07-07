'use client';

import React from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartModal({ isOpen, onClose, cart, setCart }) {
  const router = useRouter();

  if (!isOpen) return null;

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) return removeFromCart(id);
    const newCart = cart.map(item => item.id === id ? { ...item, quantity: newQuantity } : item);
    setCart(newCart);
    localStorage.setItem('hanib_cart_v2', JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const removeFromCart = (id) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    localStorage.setItem('hanib_cart_v2', JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const proceedToCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        <div className="modal-header">
          <h2>Shopping Cart</h2>
          <button onClick={onClose} className="btn-close"><X /></button>
        </div>
        
        <div className="modal-body">
          {cart.length === 0 ? (
            <p className="empty-cart">Your cart is empty.</p>
          ) : (
            <div className="table-responsive">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td className="item-name">{item.name}</td>
                      <td>₦{item.price.toLocaleString()}</td>
                      <td>
                        <div className="qty-controls">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="qty-btn"><Minus size={14}/></button>
                          <span className="qty-val">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn"><Plus size={14}/></button>
                        </div>
                      </td>
                      <td className="item-subtotal">₦{(item.price * item.quantity).toLocaleString()}</td>
                      <td>
                        <button onClick={() => removeFromCart(item.id)} className="btn-icon">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="modal-footer">
            <div className="totals">
              <h3>Grand Total: <span>₦{total.toLocaleString()}</span></h3>
              <p style={{fontSize: '0.8rem', marginTop: '0.25rem'}}>Delivery fee calculated at checkout</p>
            </div>
            <button onClick={proceedToCheckout} className="btn btn-primary w-full">Proceed to Checkout</button>
          </div>
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
        .modal-content {
          width: 95%;
          max-width: 800px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          background: var(--card);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
          overflow: hidden;
        }
        .modal-header {
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
          background: var(--card);
        }
        .modal-header h2 {
          text-transform: uppercase;
          margin: 0;
        }
        .btn-close {
          color: var(--foreground);
        }
        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
        }
        .empty-cart {
          text-align: center;
          color: var(--muted-foreground);
          padding: 2rem 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .table-responsive {
          overflow-x: auto;
        }
        .cart-table {
          width: 100%;
          border-collapse: collapse;
        }
        .cart-table th, .cart-table td {
          padding: 1rem 0.5rem;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        .cart-table th {
          text-transform: uppercase;
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }
        .item-name {
          font-weight: 600;
        }
        .qty-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .qty-btn {
          background: var(--muted);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }
        .qty-btn:hover {
          background: var(--border);
        }
        .qty-val {
          font-weight: 600;
          width: 20px;
          text-align: center;
        }
        .item-subtotal {
          font-weight: 700;
        }
        .btn-icon {
          color: var(--foreground);
        }
        .btn-icon:hover {
          color: red;
        }
        .modal-footer {
          padding: 1.5rem 2rem;
          border-top: 1px solid var(--border);
          background: var(--card);
        }
        .totals {
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-end;
        }
        .totals p {
          display: flex;
          justify-content: space-between;
          width: 300px;
          color: var(--muted-foreground);
        }
        .totals h3 {
          display: flex;
          justify-content: space-between;
          width: 300px;
          margin: 0;
          text-transform: uppercase;
        }
        .w-full {
          width: 100%;
        }
      `}</style>
    </div>
  );
}

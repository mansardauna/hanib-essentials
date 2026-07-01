'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Printer, ChevronLeft } from 'lucide-react';
import Image from 'next/image';

export default function ReceiptPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/auth');
      return;
    }

    fetch(`/api/orders`)
      .then(r => r.json())
      .then(data => {
        const found = data.find(o => o.id === id);
        if (!found) {
          setError('Order not found');
        } else if (found.userId !== user.id) {
          setError('Unauthorized');
        } else {
          setOrder(found);
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load receipt');
      });
  }, [id, user, loading, router]);

  if (loading || (!order && !error)) return <div className="container" style={{padding: '4rem 1rem'}}>Loading...</div>;
  if (error) return <div className="container" style={{padding: '4rem 1rem', color: 'red'}}>{error}</div>;

  return (
    <main className="document-container">
      <div className="document-actions no-print">
        <button onClick={() => router.back()} className="btn btn-outline">
          <ChevronLeft size={18} style={{marginRight: '0.5rem'}}/> Back
        </button>
        <button onClick={() => window.print()} className="btn btn-primary">
          <Printer size={18} style={{marginRight: '0.5rem'}}/> Print Receipt
        </button>
      </div>

      <div className="receipt-paper">
        <div className="receipt-header">
          <Image src="/images/logo.png" alt="Hanib Logo" width={150} height={60} style={{objectFit: 'contain'}} />
          <h2>Customer Receipt</h2>
          <p className="order-date">{new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString()}</p>
        </div>

        <div className="receipt-details">
          <div className="detail-group">
            <strong>Order ID:</strong> {order.id}
          </div>
          <div className="detail-group">
            <strong>Customer:</strong> {order.user.username}
          </div>
          <div className="detail-group">
            <strong>Delivery Address:</strong> {order.user.address}
          </div>
          <div className="detail-group">
            <strong>Phone:</strong> {order.user.phone}
          </div>
        </div>

        <table className="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style={{textAlign: 'center'}}>Qty</th>
              <th style={{textAlign: 'right'}}>Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name || `Product ${item.productId}`}</td>
                <td style={{textAlign: 'center'}}>{item.quantity}</td>
                <td style={{textAlign: 'right'}}>₦{(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="receipt-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₦{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Fees</span>
            <span>₦{order.items.reduce((sum, item) => sum + item.deliveryFee, 0).toLocaleString()}</span>
          </div>
          <div className="summary-row total-row">
            <span>Total Paid</span>
            <span>₦{order.total.toLocaleString()}</span>
          </div>
        </div>

        <div className="receipt-footer">
          <p>Thank you for shopping at Hanib Essentials!</p>
          <p>If you have any questions about your order, please contact support.</p>
        </div>
      </div>

      <style jsx>{`
        .document-container {
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
          min-height: 100vh;
        }
        .document-actions {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
        }
        .receipt-paper {
          background: #fff;
          padding: 3rem;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          color: #000;
        }
        .receipt-header {
          text-align: center;
          margin-bottom: 3rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #eee;
        }
        .receipt-header h2 {
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-top: 1rem;
        }
        .order-date {
          color: #666;
          font-size: 0.875rem;
        }
        .receipt-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 3rem;
        }
        .detail-group {
          font-size: 0.875rem;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2rem;
        }
        .items-table th, .items-table td {
          padding: 1rem 0;
          border-bottom: 1px solid #eee;
        }
        .items-table th {
          text-align: left;
          text-transform: uppercase;
          font-size: 0.75rem;
          color: #666;
        }
        .receipt-summary {
          width: 50%;
          margin-left: auto;
          margin-bottom: 3rem;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.875rem;
        }
        .total-row {
          font-weight: 700;
          font-size: 1.25rem;
          border-top: 2px solid #000;
          padding-top: 1rem;
          margin-top: 0.5rem;
        }
        .receipt-footer {
          text-align: center;
          font-size: 0.875rem;
          color: #666;
          padding-top: 2rem;
          border-top: 2px solid #eee;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          .document-container {
            padding: 0;
            max-width: 100%;
          }
          .receipt-paper {
            box-shadow: none;
            padding: 0;
          }
        }
      `}</style>
    </main>
  );
}

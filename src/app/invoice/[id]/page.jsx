'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Printer, ChevronLeft } from 'lucide-react';
import Image from 'next/image';

export default function InvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== 'owner') {
      router.push('/auth');
      return;
    }

    fetch(`/api/orders`)
      .then(r => r.json())
      .then(data => {
        const found = data.find(o => o.id === id);
        if (!found) {
          setError('Order not found');
        } else {
          setOrder(found);
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load invoice');
      });
  }, [id, user, loading, router]);

  if (loading || (!order && !error)) return <div className="container" style={{padding: '4rem 1rem'}}>Loading...</div>;
  if (error) return <div className="container" style={{padding: '4rem 1rem', color: 'red'}}>{error}</div>;

  return (
    <main className="document-container">
      <div className="document-actions no-print">
        <button onClick={() => router.back()} className="btn btn-outline">
          <ChevronLeft size={18} style={{marginRight: '0.5rem'}}/> Back to Dashboard
        </button>
        <button onClick={() => window.print()} className="btn btn-primary">
          <Printer size={18} style={{marginRight: '0.5rem'}}/> Print Invoice
        </button>
      </div>

      <div className="invoice-paper">
        <div className="invoice-header">
          <div className="company-info">
            <Image src="/images/logo.png" alt="Hanib Logo" width={180} height={70} style={{objectFit: 'contain'}} />
            <p style={{marginTop: '1rem'}}>123 Business Road, Commerce City</p>
            <p>support@hanibessentials.com</p>
          </div>
          <div className="invoice-title">
            <h1>INVOICE</h1>
            <p><strong>Invoice #:</strong> INV-{order.id.split('-')[0]}</p>
            <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {order.status}</p>
          </div>
        </div>

        <div className="billing-info">
          <div className="bill-to">
            <h3>Bill To:</h3>
            <p><strong>{order.user.username}</strong></p>
            <p>{order.user.address}</p>
            <p>{order.user.phone}</p>
          </div>
        </div>

        <table className="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style={{textAlign: 'center'}}>Qty</th>
              <th style={{textAlign: 'right'}}>Unit Price</th>
              <th style={{textAlign: 'right'}}>Delivery</th>
              <th style={{textAlign: 'right'}}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <p className="item-name">{item.name || `Product ${item.productId}`}</p>
                  <p className="item-id">ID: {item.productId}</p>
                </td>
                <td style={{textAlign: 'center'}}>{item.quantity}</td>
                <td style={{textAlign: 'right'}}>₦{item.price.toLocaleString()}</td>
                <td style={{textAlign: 'right'}}>₦{item.deliveryFee.toLocaleString()}</td>
                <td style={{textAlign: 'right'}}>₦{((item.price * item.quantity) + item.deliveryFee).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₦{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Total Delivery Fees:</span>
            <span>₦{order.items.reduce((sum, item) => sum + item.deliveryFee, 0).toLocaleString()}</span>
          </div>
          <div className="summary-row total-row">
            <span>Grand Total:</span>
            <span>₦{order.total.toLocaleString()}</span>
          </div>
        </div>

        <div className="invoice-footer">
          <p><strong>Payment Terms:</strong> Paid in full.</p>
          <p>Authorized Signature: _______________________</p>
        </div>
      </div>

      <style jsx>{`
        .document-container {
          padding: 2rem;
          max-width: 900px;
          margin: 0 auto;
          min-height: 100vh;
        }
        .document-actions {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
        }
        .invoice-paper {
          background: #fff;
          padding: 4rem;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          color: #333;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4rem;
        }
        .company-info p {
          color: #666;
          font-size: 0.875rem;
          margin: 0.25rem 0;
        }
        .invoice-title {
          text-align: right;
        }
        .invoice-title h1 {
          color: var(--primary);
          font-size: 3rem;
          margin-bottom: 1rem;
          letter-spacing: 2px;
        }
        .invoice-title p {
          margin: 0.25rem 0;
          font-size: 0.875rem;
        }
        .billing-info {
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid #eee;
        }
        .bill-to h3 {
          color: #999;
          text-transform: uppercase;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }
        .bill-to p {
          margin: 0.25rem 0;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2rem;
        }
        .items-table th, .items-table td {
          padding: 1.25rem 0.5rem;
          border-bottom: 1px solid #eee;
        }
        .items-table th {
          text-align: left;
          text-transform: uppercase;
          font-size: 0.75rem;
          color: #666;
          background: #fafafa;
        }
        .item-name {
          font-weight: 600;
          margin: 0 0 0.25rem 0;
        }
        .item-id {
          font-size: 0.75rem;
          color: #999;
          margin: 0;
        }
        .invoice-summary {
          width: 350px;
          margin-left: auto;
          margin-bottom: 4rem;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          font-size: 0.875rem;
        }
        .total-row {
          font-weight: 700;
          font-size: 1.5rem;
          border-top: 2px solid #333;
          padding-top: 1rem;
          margin-top: 0.5rem;
          color: var(--primary);
        }
        .invoice-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
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
          .invoice-paper {
            box-shadow: none;
            padding: 0;
          }
        }
      `}</style>
    </main>
  );
}

'use client';
import React from 'react';

export default function HelpCenterPage() {
  return (
    <main className="container" style={{padding: '3rem 1rem', minHeight: '80vh'}}>
      <h1 style={{marginBottom: '1rem'}}>Help & Support Center</h1>
      <p style={{color: 'var(--muted-foreground)', marginBottom: '2rem'}}>Find answers to your questions and get support.</p>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
        <div className="card" style={{padding: '2rem'}}>
          <h3>Order Tracking</h3>
          <p style={{color: 'var(--muted-foreground)', marginTop: '0.5rem'}}>Learn how to track your orders in real-time and what each status means.</p>
        </div>
        <div className="card" style={{padding: '2rem'}}>
          <h3>Returns & Refunds</h3>
          <p style={{color: 'var(--muted-foreground)', marginTop: '0.5rem'}}>Our hassle-free 30-day return policy ensures you are always satisfied.</p>
        </div>
        <div className="card" style={{padding: '2rem'}}>
          <h3>Contact Support</h3>
          <p style={{color: 'var(--muted-foreground)', marginTop: '0.5rem'}}>Need human help? Reach out to our 24/7 customer service team via chat.</p>
          <button className="btn btn-primary" style={{marginTop: '1rem'}}>Start Chat</button>
        </div>
      </div>
    </main>
  );
}

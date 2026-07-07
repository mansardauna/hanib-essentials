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
          <p style={{color: 'var(--muted-foreground)', marginTop: '0.5rem'}}>Need human help? Reach out to our 24/7 customer service team via WhatsApp.</p>
          <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
            <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{backgroundColor: '#25D366', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

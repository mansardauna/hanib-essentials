'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function WishlistPage() {
  const { user } = useAuth();
  
  if (!user) return <div className="container" style={{padding: '4rem 1rem'}}>Please login to view your wishlist.</div>;

  return (
    <main className="container" style={{padding: '3rem 1rem', minHeight: '80vh'}}>
      <h1 style={{marginBottom: '1rem'}}>My Wishlist</h1>
      <p style={{color: 'var(--muted-foreground)'}}>Save your favorite items here for later!</p>
      
      <div className="card" style={{padding: '3rem', textAlign: 'center', marginTop: '2rem'}}>
        <p>Your wishlist is currently empty. Start browsing and save items!</p>
        <a href="/" className="btn btn-primary" style={{marginTop: '1rem', display: 'inline-block'}}>Browse Products</a>
      </div>
    </main>
  );
}

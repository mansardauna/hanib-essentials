'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  
  if (!user) return <div className="container" style={{padding: '4rem 1rem'}}>Please login to view your settings.</div>;

  return (
    <main className="container" style={{padding: '3rem 1rem', minHeight: '80vh'}}>
      <h1 style={{marginBottom: '1rem'}}>Account Settings</h1>
      <p style={{color: 'var(--muted-foreground)', marginBottom: '2rem'}}>Manage your profile, addresses, and payment methods.</p>
      
      <div className="card" style={{padding: '2rem', maxWidth: '600px'}}>
        <div style={{marginBottom: '1.5rem'}}>
          <label style={{display: 'block', fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem'}}>Username</label>
          <input type="text" className="mui-input" defaultValue={user.username} readOnly style={{background: 'var(--muted)'}} />
        </div>
        <div style={{marginBottom: '1.5rem'}}>
          <label style={{display: 'block', fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem'}}>Delivery Address</label>
          <input type="text" className="mui-input" defaultValue={user.address || ''} placeholder="Update your address..." />
        </div>
        <div style={{marginBottom: '1.5rem'}}>
          <label style={{display: 'block', fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem'}}>Phone Number</label>
          <input type="text" className="mui-input" defaultValue={user.phone || ''} placeholder="Update your phone..." />
        </div>
        <button className="btn btn-primary">Save Changes</button>
      </div>
    </main>
  );
}

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      const res = await login(username, password);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.error);
      }
    } else {
      const res = await register(username, password, role);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.error);
      }
    }
  };

  return (
    <main className="container auth-page">
      <div className="card auth-card">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mui-form-group">
            <input 
              type="text" 
              className="mui-input" 
              placeholder=" " 
              value={username}
              onChange={e => setUsername(e.target.value)}
              required 
            />
            <label className="mui-label">Username</label>
          </div>
          <div className="mui-form-group">
            <input 
              type="password" 
              className="mui-input" 
              placeholder=" " 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
            <label className="mui-label">Password</label>
          </div>
          {!isLogin && (
            <div className="mui-form-group" style={{marginTop: '1rem'}}>
              <label style={{display: 'block', fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem'}}>Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} style={{width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 0}}>
                <option value="customer">Customer</option>
                <option value="owner">Store Owner</option>
              </select>
            </div>
          )}
          <button type="submit" className="btn btn-primary w-full" style={{marginTop: '1rem'}}>
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
        <p className="toggle-text">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="toggle-btn">
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>

      <style jsx>{`
        .auth-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 80px);
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          padding: 2rem;
        }
        .auth-card h2 {
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 2rem;
          text-align: center;
        }
        .w-full {
          width: 100%;
        }
        .error {
          color: red;
          font-size: 0.875rem;
          text-align: center;
          margin-bottom: 1rem;
        }
        .toggle-text {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.875rem;
          color: var(--muted-foreground);
        }
        .toggle-btn {
          color: var(--foreground);
          font-weight: 600;
          text-decoration: underline;
        }
      `}</style>
    </main>
  );
}

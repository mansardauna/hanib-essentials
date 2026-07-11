'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Finances() {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('expenses').select('*').order('date', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setExpenses(data);
      })
      .catch(console.error);
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newExpense = {
        id: `exp${Date.now()}`,
        description: form.description,
        amount: parseFloat(form.amount),
        date: new Date().toISOString()
      };
      
      const { data, error } = await supabase.from('expenses').insert([newExpense]).select();
      
      if (error) throw error;
      
      if (data) {
        setExpenses([data[0], ...expenses]);
      }
      
      setShowModal(false);
      setForm({ description: '', amount: '' });
    } catch (error) {
      alert('Failed to add expense. Please make sure you have run the expenses SQL script in Supabase.');
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 style={{marginBottom: '2rem'}}>Finances & Expenses</h1>
      
      <div className="card" style={{padding: '1.5rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
          <h2>Expense History</h2>
          <button className="btn btn-outline" onClick={() => setShowModal(true)}>Add Expense</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Description</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp.id}>
                <td>{exp.id}</td>
                <td>{exp.description}</td>
                <td>{new Date(exp.date).toLocaleDateString()}</td>
                <td style={{color: 'var(--destructive)', fontWeight: '600'}}>-₦{exp.amount.toLocaleString()}</td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr><td colSpan="4" style={{textAlign: 'center', color: '#999'}}>No expenses recorded.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{padding: '2rem', maxWidth: '400px', width: '100%'}}>
            <h2 style={{marginBottom: '1.5rem'}}>Add New Expense</h2>
            <form onSubmit={handleAddExpense} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <div>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>Description</label>
                <input 
                  type="text" 
                  required 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                  style={{width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)'}}
                  placeholder="e.g. Server Hosting"
                />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>Amount (₦)</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  value={form.amount} 
                  onChange={e => setForm({...form, amount: e.target.value})} 
                  style={{width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)'}}
                  placeholder="0.00"
                />
              </div>
              <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                <button type="button" className="btn btn-outline" style={{flex: 1}} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{flex: 1}} disabled={loading}>
                  {loading ? 'Adding...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th, .table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        .table th {
          color: var(--muted-foreground);
          font-weight: 500;
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
      `}</style>
    </div>
  );
}

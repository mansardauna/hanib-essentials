'use client';

import React, { useState, useEffect } from 'react';

export default function Finances() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetch('/api/expenses').then(r => r.json()).then(setExpenses).catch(console.error);
  }, []);

  return (
    <div>
      <h1 style={{marginBottom: '2rem'}}>Finances & Expenses</h1>
      
      <div className="card" style={{padding: '1.5rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
          <h2>Expense History</h2>
          <button className="btn btn-outline">Add Expense</button>
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
          </tbody>
        </table>
      </div>

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
      `}</style>
    </div>
  );
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    return NextResponse.json(db.expenses || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load expenses' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const expense = await request.json();
    const db = await getDb();
    
    const newExpense = {
      id: `exp${Date.now()}`,
      date: new Date().toISOString(),
      ...expense
    };
    
    if (!db.expenses) db.expenses = [];
    db.expenses.push(newExpense);
    
    const fs = require('fs/promises');
    const path = require('path');
    await fs.writeFile(path.join(process.cwd(), 'data', 'db.json'), JSON.stringify(db, null, 2));
    
    return NextResponse.json(newExpense);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add expense' }, { status: 500 });
  }
}

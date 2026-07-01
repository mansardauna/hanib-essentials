import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    return NextResponse.json(db.expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load expenses' }, { status: 500 });
  }
}

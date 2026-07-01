import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    return NextResponse.json(db.products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = await getDb();
    const newProduct = {
      id: `p${Date.now()}`,
      ...body
    };
    db.products.push(newProduct);
    await saveDb(db);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const db = await getDb();
    const index = db.products.findIndex(p => p.id === body.id);
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    db.products[index] = { ...db.products[index], ...body };
    await saveDb(db);
    return NextResponse.json(db.products[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

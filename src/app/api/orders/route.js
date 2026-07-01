import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const db = await getDb();
    
    if (userId) {
      return NextResponse.json(db.orders.filter(o => o.userId === userId));
    }
    return NextResponse.json(db.orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = await getDb();
    
    // Validate stock
    for (const item of body.items) {
      const product = db.products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return NextResponse.json({ error: `Not enough stock for ${product?.name || item.productId}` }, { status: 400 });
      }
    }

    // Decrement stock
    for (const item of body.items) {
      const product = db.products.find(p => p.id === item.productId);
      product.stock -= item.quantity;
    }

    const newOrder = {
      id: `o${Date.now()}`,
      userId: body.userId,
      items: body.items,
      subtotal: body.subtotal,
      deliveryFee: body.deliveryFee,
      total: body.total,
      status: "Processing",
      date: new Date().toISOString()
    };
    
    db.orders.push(newOrder);
    await saveDb(db);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const db = await getDb();
    const orderIndex = db.orders.findIndex(o => o.id === body.id);
    if (orderIndex === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    db.orders[orderIndex].status = body.status;
    await saveDb(db);
    return NextResponse.json(db.orders[orderIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

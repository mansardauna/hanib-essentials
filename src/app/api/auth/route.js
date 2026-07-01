import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function POST(request) {
  try {
    const { action, username, password, role } = await request.json();
    const db = await getDb();
    
    if (action === 'login') {
      const user = db.users.find(u => u.username === username && u.password === password);
      if (user) {
        const { password: _, ...userWithoutPass } = user;
        return NextResponse.json(userWithoutPass);
      }
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    if (action === 'register') {
      if (db.users.find(u => u.username === username)) {
        return NextResponse.json({ error: 'Username taken' }, { status: 400 });
      }
      const newUser = {
        id: `u${Date.now()}`,
        username,
        password,
        role: role || 'customer',
        address: '',
        phone: ''
      };
      db.users.push(newUser);
      await saveDb(db);
      const { password: _, ...userWithoutPass } = newUser;
      return NextResponse.json(userWithoutPass, { status: 201 });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, address, phone } = await request.json();
    const db = await getDb();
    const user = db.users.find(u => u.id === id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    
    user.address = address;
    user.phone = phone;
    await saveDb(db);
    
    const { password: _, ...userWithoutPass } = user;
    return NextResponse.json(userWithoutPass);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

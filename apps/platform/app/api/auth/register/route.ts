import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: '邮箱和密码为必填项' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: '密码至少 6 位' }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: '该邮箱已注册' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.create({ data: { name: name || null, email, passwordHash } });

  return NextResponse.json({ ok: true }, { status: 201 });
}

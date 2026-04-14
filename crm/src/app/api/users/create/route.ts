import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });

  try {
    const { username, password, name, role, email, phone } = await req.json();
    if (!username || !password || !name) return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return NextResponse.json({ error: 'Username đã tồn tại' }, { status: 400 });

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username, password: hashed, name, role: role || 'staff', email: email || null, phone: phone || null },
    });

    return NextResponse.json({ user: { id: user.id, username: user.username, name: user.name, role: user.role } }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

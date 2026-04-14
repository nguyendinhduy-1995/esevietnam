import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  try {
    const { amount, method, note } = await req.json();
    if (!amount || amount <= 0) return NextResponse.json({ error: 'Số tiền không hợp lệ' }, { status: 400 });

    const payment = await prisma.payment.create({
      data: { studentId: id, amount: parseFloat(amount), method: method || 'cash', note },
    });

    await prisma.student.update({
      where: { id },
      data: { paidAmount: { increment: parseFloat(amount) } },
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

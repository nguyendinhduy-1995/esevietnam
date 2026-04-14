import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const program = url.searchParams.get('program');
  const search = url.searchParams.get('search');

  const where: Record<string, unknown> = {};
  if (status && status !== 'ALL') where.status = status;
  if (program && program !== 'ALL') where.program = program;
  if (search) {
    where.OR = [{ parentName: { contains: search } }, { childName: { contains: search } }, { phone: { contains: search } }];
  }

  const students = await prisma.student.findMany({
    where,
    include: { payments: { orderBy: { createdAt: 'desc' } }, _count: { select: { schedules: true, notes: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ students });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { leadId, parentName, childName, phone, program, package: pkg, totalFee, startDate } = body;

    if (!leadId || !parentName || !phone || !program || !pkg || !totalFee) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    const student = await prisma.student.create({
      data: {
        leadId, parentName, childName, phone, program, package: pkg,
        totalFee: parseFloat(totalFee),
        startDate: startDate ? new Date(startDate) : null,
      },
    });

    // Auto-update lead to CONVERTED
    await prisma.lead.update({ where: { id: leadId }, data: { status: 'CONVERTED' } });
    await prisma.leadEvent.create({
      data: { leadId, type: 'STATUS_CHANGE', payload: JSON.stringify({ from: 'APPOINTED', to: 'CONVERTED' }), createdById: session.id },
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

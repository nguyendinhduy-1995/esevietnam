import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const source = url.searchParams.get('source');
  const search = url.searchParams.get('search');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');

  const where: Record<string, unknown> = {};
  if (status && status !== 'ALL') where.status = status;
  if (source && source !== 'ALL') where.source = source;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { childName: { contains: search } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: { assignedTo: { select: { id: true, name: true } }, _count: { select: { calls: true, notes: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({ leads, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { name, phone, source, childName, childAge, package: pkg, message, assignedId } = body;

    if (!name || !phone || !source) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    const phoneClean = phone.replace(/\s/g, '');
    if (!/^0\d{9}$/.test(phoneClean)) {
      return NextResponse.json({ error: 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)' }, { status: 400 });
    }

    const existing = await prisma.lead.findUnique({ where: { phone: phoneClean } });
    if (existing) {
      const updated = await prisma.lead.update({
        where: { phone: phoneClean },
        data: { formSubmitCount: { increment: 1 }, message: message || existing.message },
      });
      return NextResponse.json({ lead: updated, duplicate: true });
    }

    const lead = await prisma.lead.create({
      data: { name, phone: phoneClean, source, childName, childAge: childAge ? parseInt(childAge) : null, package: pkg, message, assignedId },
    });

    await prisma.leadEvent.create({
      data: { leadId: lead.id, type: 'STATUS_CHANGE', payload: JSON.stringify({ from: null, to: 'NEW' }), createdById: session.id },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

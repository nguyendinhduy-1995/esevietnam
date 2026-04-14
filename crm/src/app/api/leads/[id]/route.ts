import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true } },
      notes: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      calls: { include: { staff: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      events: { include: { createdBy: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      student: true,
    },
  });

  if (!lead) return NextResponse.json({ error: 'Không tìm thấy lead' }, { status: 404 });
  return NextResponse.json({ lead });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  try {
    const body = await req.json();
    const { status, assignedId, lostReason, priority, ...rest } = body;

    const current = await prisma.lead.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: 'Không tìm thấy lead' }, { status: 404 });

    const data: Record<string, unknown> = { ...rest };
    if (status !== undefined) data.status = status;
    if (assignedId !== undefined) data.assignedId = assignedId || null;
    if (lostReason !== undefined) data.lostReason = lostReason;
    if (priority !== undefined) data.priority = priority;

    const lead = await prisma.lead.update({ where: { id }, data });

    if (status && status !== current.status) {
      await prisma.leadEvent.create({
        data: { leadId: id, type: 'STATUS_CHANGE', payload: JSON.stringify({ from: current.status, to: status }), createdById: session.id },
      });
    }

    if (assignedId && assignedId !== current.assignedId) {
      await prisma.leadEvent.create({
        data: { leadId: id, type: 'ASSIGNMENT', payload: JSON.stringify({ assignedId }), createdById: session.id },
      });
    }

    return NextResponse.json({ lead });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
  const { id } = await params;

  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

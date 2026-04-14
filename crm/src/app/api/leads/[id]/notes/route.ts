import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  try {
    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: 'Nội dung không được trống' }, { status: 400 });

    const note = await prisma.note.create({
      data: { content, leadId: id, userId: session.id },
      include: { user: { select: { name: true } } },
    });

    await prisma.leadEvent.create({
      data: { leadId: id, type: 'NOTE', payload: JSON.stringify({ content }), createdById: session.id },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const leadId = url.searchParams.get('leadId');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (leadId) where.leadId = leadId;

  const [calls, total] = await Promise.all([
    prisma.callRecord.findMany({
      where,
      include: { lead: { select: { name: true, phone: true } }, staff: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.callRecord.count({ where }),
  ]);

  return NextResponse.json({ calls, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const leadId = formData.get('leadId') as string;
    const outcome = formData.get('outcome') as string || 'PENDING';
    const notes = formData.get('notes') as string || '';
    const duration = parseInt(formData.get('duration') as string || '0');
    const audioFile = formData.get('audio') as File | null;

    if (!leadId) return NextResponse.json({ error: 'Thiếu leadId' }, { status: 400 });

    let audioPath: string | null = null;
    if (audioFile && audioFile.size > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'recordings');
      await mkdir(uploadDir, { recursive: true });
      const ext = audioFile.name.split('.').pop() || 'mp3';
      const fileName = `call_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      await writeFile(path.join(uploadDir, fileName), buffer);
      audioPath = `/uploads/recordings/${fileName}`;
    }

    const call = await prisma.callRecord.create({
      data: { leadId, staffId: session.id, outcome, notes, duration, audioPath },
      include: { lead: { select: { name: true, phone: true } }, staff: { select: { name: true } } },
    });

    // Auto update lead status
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (lead && (lead.status === 'NEW' || lead.status === 'CONTACTED')) {
      await prisma.lead.update({ where: { id: leadId }, data: { status: 'CONTACTED' } });
    }

    await prisma.leadEvent.create({
      data: { leadId, type: 'CALL', payload: JSON.stringify({ outcome, callId: call.id }), createdById: session.id },
    });

    return NextResponse.json({ call }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

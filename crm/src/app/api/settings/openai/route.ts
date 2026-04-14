import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const config = await prisma.systemConfig.findUnique({ where: { key: 'openai_api_key' } });
  return NextResponse.json({ hasKey: !!config?.value });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });

  const { apiKey } = await req.json();
  if (!apiKey) return NextResponse.json({ error: 'Thiếu API key' }, { status: 400 });

  await prisma.systemConfig.upsert({
    where: { key: 'openai_api_key' },
    update: { value: apiKey },
    create: { key: 'openai_api_key', value: apiKey },
  });

  // Also update .env runtime
  process.env.OPENAI_API_KEY = apiKey;

  return NextResponse.json({ success: true });
}

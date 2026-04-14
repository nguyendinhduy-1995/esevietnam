import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const fbPixelConfig = await prisma.systemConfig.findUnique({ where: { key: 'fb_pixel_id' } });
  const gaConfig = await prisma.systemConfig.findUnique({ where: { key: 'ga_measurement_id' } });

  return NextResponse.json({
    fbPixelId: fbPixelConfig?.value || '',
    gaId: gaConfig?.value || '',
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });

  const { fbPixelId, gaId } = await req.json();

  // Upsert Facebook Pixel ID
  if (fbPixelId !== undefined) {
    await prisma.systemConfig.upsert({
      where: { key: 'fb_pixel_id' },
      update: { value: fbPixelId },
      create: { key: 'fb_pixel_id', value: fbPixelId },
    });
  }

  // Upsert Google Analytics ID
  if (gaId !== undefined) {
    await prisma.systemConfig.upsert({
      where: { key: 'ga_measurement_id' },
      update: { value: gaId },
      create: { key: 'ga_measurement_id', value: gaId },
    });
  }

  return NextResponse.json({ ok: true });
}

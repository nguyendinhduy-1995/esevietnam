import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Public endpoint - no auth required
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, page, event, data, utmSource, utmMedium, utmCampaign, referrer } = body;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (!sessionId || !page || !event) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders });
    }

    await prisma.analyticsEvent.create({
      data: {
        sessionId,
        page,
        event,
        data: data ? JSON.stringify(data) : null,
        userAgent: req.headers.get('user-agent') || null,
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
        referrer: referrer || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
      },
    });

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

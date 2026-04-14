import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Public endpoint - no auth required (called from landing pages)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, source, childName, childAge, package: pkg, message, sessionId, utmSource, utmMedium, utmCampaign } = body;

    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };

    if (!name || !phone) {
      return NextResponse.json({ error: 'Vui lòng nhập họ tên và số điện thoại' }, { status: 400, headers: cors });
    }

    const phoneClean = phone.replace(/\s/g, '').replace(/-/g, '');
    if (!/^0\d{9}$/.test(phoneClean)) {
      return NextResponse.json({ error: 'Số điện thoại không hợp lệ' }, { status: 400, headers: cors });
    }

    const existing = await prisma.lead.findUnique({ where: { phone: phoneClean } });
    if (existing) {
      await prisma.lead.update({
        where: { phone: phoneClean },
        data: {
          formSubmitCount: { increment: 1 },
          message: message || existing.message,
          childName: childName || existing.childName,
          childAge: childAge ? parseInt(childAge) : existing.childAge,
        },
      });
      return NextResponse.json({ success: true, message: 'Cảm ơn bạn! Chúng tôi sẽ liên hệ sớm nhất.' }, { headers: cors });
    }

    await prisma.lead.create({
      data: {
        name,
        phone: phoneClean,
        source: source || 'elite_presence',
        childName: childName || null,
        childAge: childAge ? parseInt(childAge) : null,
        package: pkg || null,
        message: message || null,
        sessionId: sessionId || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
      },
    });

    // Track form submit event
    if (sessionId) {
      await prisma.analyticsEvent.create({
        data: {
          sessionId,
          page: source || 'elite_presence',
          event: 'FORM_SUBMIT',
          data: JSON.stringify({ name, phone: phoneClean }),
          userAgent: req.headers.get('user-agent'),
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Đăng ký thành công! Chúng tôi sẽ liên hệ bạn trong thời gian sớm nhất.' }, { headers: cors });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
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

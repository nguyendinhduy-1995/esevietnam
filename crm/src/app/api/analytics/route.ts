import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

function parseDevice(ua: string | null): string {
  if (!ua) return 'Không xác định';
  const lower = ua.toLowerCase();
  if (/iphone|ipad|ipod/.test(lower)) return 'iPhone/iPad';
  if (/android/.test(lower)) {
    if (/tablet|sm-t|gt-p/.test(lower)) return 'Máy tính bảng Android';
    return 'Điện thoại Android';
  }
  if (/macintosh|mac os/.test(lower)) return 'Máy Mac';
  if (/windows/.test(lower)) return 'Máy tính Windows';
  if (/linux/.test(lower)) return 'Linux';
  return 'Khác';
}

function parseBrowser(ua: string | null): string {
  if (!ua) return 'Không xác định';
  if (/coc_coc|coccocbrowser/i.test(ua)) return 'Cốc Cốc';
  if (/edg\//i.test(ua)) return 'Edge';
  if (/chrome/i.test(ua) && !/chromium/i.test(ua)) return 'Chrome';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/opera|opr/i.test(ua)) return 'Opera';
  return 'Khác';
}

function isMobile(ua: string | null): boolean {
  if (!ua) return false;
  return /mobile|android|iphone|ipad|ipod|phone/i.test(ua);
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const fromParam = url.searchParams.get('from');
  const toParam = url.searchParams.get('to');
  const days = parseInt(url.searchParams.get('days') || '30');

  let since: Date;
  let until: Date;

  if (fromParam && toParam) {
    since = new Date(fromParam + 'T00:00:00');
    until = new Date(toParam + 'T23:59:59.999');
  } else if (fromParam) {
    since = new Date(fromParam + 'T00:00:00');
    until = new Date();
  } else {
    since = new Date(Date.now() - days * 86400000);
    until = new Date();
  }

  const events = await prisma.analyticsEvent.findMany({
    where: { createdAt: { gte: since, lte: until } },
    orderBy: { createdAt: 'desc' },
  });

  // Aggregate by page
  const byPage: Record<string, Record<string, number>> = {};
  const byDay: Record<string, number> = {};
  const funnels: Record<string, { PAGE_VIEW: number; SCROLL_DEPTH: number; CTA_CLICK: number; FORM_START: number; FORM_SUBMIT: number }> = {};
  
  // Device & browser stats
  const deviceStats: Record<string, number> = {};
  const browserStats: Record<string, number> = {};
  let mobileCount = 0;
  let desktopCount = 0;

  // Referrer stats
  const referrerStats: Record<string, number> = {};

  // UTM stats
  const utmSourceStats: Record<string, number> = {};
  const utmMediumStats: Record<string, number> = {};
  const utmCampaignStats: Record<string, number> = {};

  // Session tracking for avg time calculation
  const sessionTimes: Record<string, { first: Date; last: Date; page: string }> = {};
  // Hourly distribution
  const hourlyStats: Record<number, number> = {};
  for (let h = 0; h < 24; h++) hourlyStats[h] = 0;

  // Unique sessions set
  const sessionSet = new Set<string>();

  for (const e of events) {
    // By page
    if (!byPage[e.page]) byPage[e.page] = {};
    byPage[e.page][e.event] = (byPage[e.page][e.event] || 0) + 1;

    // By day
    const day = e.createdAt.toISOString().split('T')[0];
    byDay[day] = (byDay[day] || 0) + 1;

    // Funnels
    if (!funnels[e.page]) funnels[e.page] = { PAGE_VIEW: 0, SCROLL_DEPTH: 0, CTA_CLICK: 0, FORM_START: 0, FORM_SUBMIT: 0 };
    if (e.event in funnels[e.page]) {
      funnels[e.page][e.event as keyof typeof funnels[string]]++;
    }

    // Device
    const device = parseDevice(e.userAgent);
    deviceStats[device] = (deviceStats[device] || 0) + 1;

    // Browser
    const browser = parseBrowser(e.userAgent);
    browserStats[browser] = (browserStats[browser] || 0) + 1;

    // Mobile vs Desktop
    if (isMobile(e.userAgent)) mobileCount++;
    else desktopCount++;

    // Referrer
    if (e.referrer) {
      try {
        const refHost = new URL(e.referrer).hostname.replace('www.', '');
        const label = refHost === 'facebook.com' || refHost === 'm.facebook.com' ? 'Facebook'
          : refHost === 'google.com' || refHost.includes('google.') ? 'Google'
          : refHost === 'zalo.me' || refHost.includes('zalo') ? 'Zalo'
          : refHost === 'tiktok.com' ? 'TikTok'
          : refHost.includes('instagram') ? 'Instagram'
          : refHost;
        referrerStats[label] = (referrerStats[label] || 0) + 1;
      } catch {
        referrerStats['Trực tiếp'] = (referrerStats['Trực tiếp'] || 0) + 1;
      }
    } else {
      referrerStats['Trực tiếp'] = (referrerStats['Trực tiếp'] || 0) + 1;
    }

    // UTM
    if (e.utmSource) utmSourceStats[e.utmSource] = (utmSourceStats[e.utmSource] || 0) + 1;
    if (e.utmMedium) utmMediumStats[e.utmMedium] = (utmMediumStats[e.utmMedium] || 0) + 1;
    if (e.utmCampaign) utmCampaignStats[e.utmCampaign] = (utmCampaignStats[e.utmCampaign] || 0) + 1;

    // Session time tracking
    sessionSet.add(e.sessionId);
    if (!sessionTimes[e.sessionId]) {
      sessionTimes[e.sessionId] = { first: e.createdAt, last: e.createdAt, page: e.page };
    } else {
      if (e.createdAt < sessionTimes[e.sessionId].first) sessionTimes[e.sessionId].first = e.createdAt;
      if (e.createdAt > sessionTimes[e.sessionId].last) sessionTimes[e.sessionId].last = e.createdAt;
    }

    // Hourly
    const hour = e.createdAt.getHours();
    hourlyStats[hour]++;
  }

  // Calculate average session duration (seconds)
  const sessionDurations: number[] = [];
  for (const sid of Object.keys(sessionTimes)) {
    const s = sessionTimes[sid];
    const dur = (s.last.getTime() - s.first.getTime()) / 1000;
    if (dur > 0) sessionDurations.push(dur);
  }
  const avgSessionDuration = sessionDurations.length > 0 ? Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length) : 0;

  // Bounce rate: sessions with only 1 event
  const sessionEventCount: Record<string, number> = {};
  for (const e of events) {
    sessionEventCount[e.sessionId] = (sessionEventCount[e.sessionId] || 0) + 1;
  }
  const totalSessions = sessionSet.size;
  const bouncedSessions = Object.values(sessionEventCount).filter(c => c === 1).length;
  const bounceRate = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0;

  // Events per session
  const eventsPerSession = totalSessions > 0 ? parseFloat((events.length / totalSessions).toFixed(1)) : 0;

  return NextResponse.json({
    totalEvents: events.length,
    uniqueSessions: totalSessions,
    byPage,
    byDay,
    funnels,
    period: days,
    // Advanced metrics
    deviceStats,
    browserStats,
    mobileVsDesktop: { mobile: mobileCount, desktop: desktopCount },
    referrerStats,
    utmSourceStats,
    utmMediumStats,
    utmCampaignStats,
    hourlyStats,
    avgSessionDuration,
    bounceRate,
    eventsPerSession,
  });
}

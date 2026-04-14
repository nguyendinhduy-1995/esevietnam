import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/');

  const [totalLeads, newLeads, contactedLeads, appointedLeads, convertedLeads, lostLeads, totalStudents, leadsBySource, recentLeads, analyticsCount] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.lead.count({ where: { status: 'CONTACTED' } }),
    prisma.lead.count({ where: { status: 'APPOINTED' } }),
    prisma.lead.count({ where: { status: 'CONVERTED' } }),
    prisma.lead.count({ where: { status: 'LOST' } }),
    prisma.student.count(),
    prisma.lead.groupBy({ by: ['source'], _count: true }),
    prisma.lead.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { assignedTo: { select: { name: true } } } }),
    prisma.analyticsEvent.count(),
  ]);

  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

  const pipelineData = [
    { name: 'Mới', value: newLeads, color: '#6366f1' },
    { name: 'Đã liên hệ', value: contactedLeads, color: '#f59e0b' },
    { name: 'Có lịch hẹn', value: appointedLeads, color: '#3b82f6' },
    { name: 'Chuyển đổi', value: convertedLeads, color: '#10b981' },
    { name: 'Đã mất', value: lostLeads, color: '#ef4444' },
  ];

  const sourceData = leadsBySource.map(s => ({
    name: s.source === 'elite_presence' ? 'Élite Presence' : s.source === 'teen_etiquette' ? 'Teen Etiquette' : 'Kidiquette',
    value: s._count,
    color: s.source === 'elite_presence' ? '#d4a45a' : s.source === 'teen_etiquette' ? '#6366f1' : '#f59e0b',
  }));

  return (
    <DashboardClient
      kpis={{ totalLeads, newLeads, convertedLeads, conversionRate, totalStudents, analyticsCount }}
      pipelineData={pipelineData}
      sourceData={sourceData}
      recentLeads={recentLeads.map(l => ({
        id: l.id, name: l.name, phone: l.phone, source: l.source,
        status: l.status, assignedTo: l.assignedTo?.name || null,
        createdAt: l.createdAt.toISOString(),
      }))}
    />
  );
}

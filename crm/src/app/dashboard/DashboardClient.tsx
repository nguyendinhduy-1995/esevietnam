'use client';
import Link from 'next/link';
import { SOURCE_LABELS, STATUS_LABELS, timeAgo } from '@/lib/utils';

interface Props {
  kpis: { totalLeads: number; newLeads: number; convertedLeads: number; conversionRate: string; totalStudents: number; analyticsCount: number };
  pipelineData: { name: string; value: number; color: string }[];
  sourceData: { name: string; value: number; color: string }[];
  recentLeads: { id: string; name: string; phone: string; source: string; status: string; assignedTo: string | null; createdAt: string }[];
}

export default function DashboardClient({ kpis, pipelineData, sourceData, recentLeads }: Props) {
  const maxPipeline = Math.max(...pipelineData.map(d => d.value), 1);
  const totalSource = sourceData.reduce((a, b) => a + b.value, 0) || 1;

  return (
    <div>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Tổng Lead</span>
          <span className="kpi-value">{kpis.totalLeads}</span>
          <span className="kpi-change up">Từ 3 landing pages</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Lead Mới</span>
          <span className="kpi-value">{kpis.newLeads}</span>
          <span className="kpi-change" style={{ color: 'var(--accent-indigo)' }}>Chờ xử lý</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Đã Chuyển Đổi</span>
          <span className="kpi-value">{kpis.convertedLeads}</span>
          <span className="kpi-change up">Tỷ lệ: {kpis.conversionRate}%</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Học Viên</span>
          <span className="kpi-value">{kpis.totalStudents}</span>
          <span className="kpi-change up">Đang hoạt động</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 32 }}>
        {/* Pipeline Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Pipeline Tổng Quan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pipelineData.map(d => (
              <div key={d.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                  <span style={{ fontWeight: 700, color: d.color }}>{d.value}</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-primary)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(d.value / maxPipeline) * 100}%`, background: d.color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Distribution */}
        <div className="chart-container">
          <h3 className="chart-title">Nguồn Lead</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sourceData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{d.name}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{d.value} ({((d.value / totalSource) * 100).toFixed(0)}%)</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-primary)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(d.value / totalSource) * 100}%`, background: d.color, borderRadius: 3 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {sourceData.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Chưa có dữ liệu</p>}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="chart-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 className="chart-title" style={{ margin: 0 }}>Lead Gần Đây</h3>
          <Link href="/dashboard/leads" className="btn btn-secondary btn-sm">Xem tất cả →</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>SĐT</th>
                <th>Nguồn</th>
                <th>Trạng thái</th>
                <th>Phụ trách</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map(lead => (
                <tr key={lead.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.name}</td>
                  <td><a href={`tel:${lead.phone}`} style={{ color: 'var(--gold)' }}>{lead.phone}</a></td>
                  <td>
                    <span className={`badge ${lead.source === 'elite_presence' ? 'badge-elite' : lead.source === 'teen_etiquette' ? 'badge-teen' : 'badge-kid'}`}>
                      {SOURCE_LABELS[lead.source] || lead.source}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${lead.status.toLowerCase()}`}>
                      {STATUS_LABELS[lead.status] || lead.status}
                    </span>
                  </td>
                  <td style={{ color: lead.assignedTo ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                    {lead.assignedTo || 'Chưa phân'}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{timeAgo(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

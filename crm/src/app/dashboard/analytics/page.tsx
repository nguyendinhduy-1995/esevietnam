'use client';
import { useState, useEffect, useCallback } from 'react';
import { SOURCE_LABELS } from '@/lib/utils';

interface AnalyticsData {
  totalEvents: number;
  uniqueSessions: number;
  byPage: Record<string, Record<string, number>>;
  byDay: Record<string, number>;
  funnels: Record<string, { PAGE_VIEW: number; SCROLL_DEPTH: number; CTA_CLICK: number; FORM_START: number; FORM_SUBMIT: number }>;
  period: number;
  deviceStats: Record<string, number>;
  browserStats: Record<string, number>;
  mobileVsDesktop: { mobile: number; desktop: number };
  referrerStats: Record<string, number>;
  utmSourceStats: Record<string, number>;
  utmMediumStats: Record<string, number>;
  utmCampaignStats: Record<string, number>;
  hourlyStats: Record<string, number>;
  avgSessionDuration: number;
  bounceRate: number;
  eventsPerSession: number;
}

const EVENT_LABELS: Record<string, string> = {
  PAGE_VIEW: 'Lượt xem',
  SCROLL_DEPTH: 'Cuộn trang',
  CTA_CLICK: 'Nhấn nút',
  FORM_START: 'Mở đăng ký',
  FORM_SUBMIT: 'Gửi đăng ký',
  TIME_ON_PAGE: 'Thời gian',
};

const FUNNEL_COLORS = ['#6366f1', '#3b82f6', '#f59e0b', '#f97316', '#10b981'];

function fmtDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function fmtDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} giây`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m} phút ${s} giây` : `${m} phút`;
}

function getPresetRange(preset: string): { from: string; to: string } {
  const now = new Date();
  const to = fmtDate(now);
  switch (preset) {
    case 'today': return { from: to, to };
    case 'yesterday': {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      return { from: fmtDate(y), to: fmtDate(y) };
    }
    case '7d': { const d = new Date(now); d.setDate(d.getDate() - 6); return { from: fmtDate(d), to }; }
    case '14d': { const d = new Date(now); d.setDate(d.getDate() - 13); return { from: fmtDate(d), to }; }
    case '30d': { const d = new Date(now); d.setDate(d.getDate() - 29); return { from: fmtDate(d), to }; }
    case '90d': { const d = new Date(now); d.setDate(d.getDate() - 89); return { from: fmtDate(d), to }; }
    default: { const d = new Date(now); d.setDate(d.getDate() - 29); return { from: fmtDate(d), to }; }
  }
}

/* Horizontal bar chart row */
function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 3 }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${max > 0 ? (value / max) * 100 : 0}%`, background: color, borderRadius: 3, transition: 'width 0.5s' }} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePreset, setActivePreset] = useState('30d');
  const [fromDate, setFromDate] = useState(() => getPresetRange('30d').from);
  const [toDate, setToDate] = useState(() => getPresetRange('30d').to);

  const fetchData = useCallback((from: string, to: string) => {
    setLoading(true);
    fetch(`/api/analytics?from=${from}&to=${to}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(fromDate, toDate); }, [fromDate, toDate, fetchData]);

  const handlePreset = (preset: string) => {
    setActivePreset(preset);
    const { from, to } = getPresetRange(preset);
    setFromDate(from);
    setToDate(to);
  };

  if (!data && loading) return <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;

  const pages = data ? Object.keys(data.funnels) : [];
  const presets = [
    { key: 'today', label: 'Hôm nay' },
    { key: 'yesterday', label: 'Hôm qua' },
    { key: '7d', label: '7 ngày' },
    { key: '14d', label: '14 ngày' },
    { key: '30d', label: '30 ngày' },
    { key: '90d', label: '90 ngày' },
  ];

  return (
    <div className={loading ? 'data-loading' : ''}>
      {/* Bộ lọc thời gian */}
      <div className="analytics-date-bar">
        <div className="analytics-presets">
          {presets.map(p => (
            <button key={p.key} className={`btn btn-sm ${activePreset === p.key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handlePreset(p.key)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="analytics-date-inputs">
          <label className="analytics-date-label">Từ</label>
          <input type="date" value={fromDate} max={toDate} onChange={e => { setActivePreset('custom'); setFromDate(e.target.value); }} className="analytics-date-input" />
          <label className="analytics-date-label">đến</label>
          <input type="date" value={toDate} min={fromDate} max={fmtDate(new Date())} onChange={e => { setActivePreset('custom'); setToDate(e.target.value); }} className="analytics-date-input" />
        </div>
      </div>

      {!data ? (
        <div className="empty-state"><h4>Không có dữ liệu</h4></div>
      ) : (
        <>
          {/* Tổng quan KPI */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-label">Tổng lượt tương tác</span>
              <span className="kpi-value">{data.totalEvents.toLocaleString('vi-VN')}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Phiên truy cập</span>
              <span className="kpi-value">{data.uniqueSessions.toLocaleString('vi-VN')}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Đơn đăng ký</span>
              <span className="kpi-value">{pages.reduce((a, p) => a + (data.funnels[p]?.FORM_SUBMIT || 0), 0)}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Thời gian trung bình</span>
              <span className="kpi-value" style={{ fontSize: '1.5rem' }}>{fmtDuration(data.avgSessionDuration)}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Tỷ lệ thoát trang</span>
              <span className="kpi-value">{data.bounceRate}%</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Tương tác / phiên</span>
              <span className="kpi-value">{data.eventsPerSession}</span>
            </div>
          </div>

          {/* Phễu chuyển đổi */}
          <div className="chart-container" style={{ marginBottom: 24 }}>
            <h3 className="chart-title">Phễu chuyển đổi theo trang</h3>
            <div className="analytics-funnel-grid">
              {pages.map(page => {
                const funnel = data.funnels[page];
                const steps = [
                  { label: 'Lượt xem', value: funnel.PAGE_VIEW },
                  { label: 'Cuộn trang', value: funnel.SCROLL_DEPTH },
                  { label: 'Nhấn nút', value: funnel.CTA_CLICK },
                  { label: 'Mở đăng ký', value: funnel.FORM_START },
                  { label: 'Gửi đăng ký', value: funnel.FORM_SUBMIT },
                ];
                const maxVal = Math.max(...steps.map(s => s.value), 1);
                return (
                  <div key={page} style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 16 }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 16, color: page === 'elite_presence' ? 'var(--gold)' : page === 'teen_etiquette' ? 'var(--accent-indigo)' : 'var(--accent-amber)' }}>
                      {SOURCE_LABELS[page] || page}
                    </h4>
                    {steps.map((step, i) => (
                      <div key={step.label} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 3 }}>
                          <span style={{ color: 'var(--text-muted)' }}>{step.label}</span>
                          <span style={{ fontWeight: 700, color: FUNNEL_COLORS[i] }}>{step.value}</span>
                        </div>
                        <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(step.value / maxVal) * 100}%`, background: FUNNEL_COLORS[i], borderRadius: 3, transition: 'width 0.5s' }} />
                        </div>
                        {i < steps.length - 1 && steps[i].value > 0 && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: 2 }}>
                            ↓ {((steps[i + 1].value / steps[i].value) * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row: Thiết bị + Trình duyệt + Nguồn truy cập */}
          <div className="analytics-detail-grid" style={{ marginBottom: 24 }}>
            {/* Thiết bị */}
            <div className="chart-container">
              <h3 className="chart-title">Thiết bị truy cập</h3>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1, textAlign: 'center', padding: 12, background: 'var(--bg-primary)', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Di động</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                    {data.mobileVsDesktop.mobile}
                    <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>
                      ({data.totalEvents > 0 ? Math.round((data.mobileVsDesktop.mobile / data.totalEvents) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: 12, background: 'var(--bg-primary)', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Máy tính</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-indigo)' }}>
                    {data.mobileVsDesktop.desktop}
                    <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>
                      ({data.totalEvents > 0 ? Math.round((data.mobileVsDesktop.desktop / data.totalEvents) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
              {Object.entries(data.deviceStats).sort(([, a], [, b]) => b - a).map(([device, count]) => {
                const max = Math.max(...Object.values(data.deviceStats));
                return <BarRow key={device} label={device} value={count} max={max} color="var(--accent-blue)" />;
              })}
            </div>

            {/* Trình duyệt */}
            <div className="chart-container">
              <h3 className="chart-title">Trình duyệt</h3>
              {Object.entries(data.browserStats).sort(([, a], [, b]) => b - a).map(([browser, count]) => {
                const max = Math.max(...Object.values(data.browserStats));
                return <BarRow key={browser} label={browser} value={count} max={max} color="var(--accent-purple)" />;
              })}
            </div>

            {/* Nguồn truy cập */}
            <div className="chart-container">
              <h3 className="chart-title">Nguồn truy cập</h3>
              {Object.entries(data.referrerStats).sort(([, a], [, b]) => b - a).map(([ref, count]) => {
                const max = Math.max(...Object.values(data.referrerStats));
                const color = ref === 'Facebook' ? '#1877F2' : ref === 'Google' ? '#34A853' : ref === 'Zalo' ? '#0068FF' : ref === 'TikTok' ? '#ff0050' : 'var(--gold)';
                return <BarRow key={ref} label={ref} value={count} max={max} color={color} />;
              })}
            </div>
          </div>

          {/* Giờ truy cập cao điểm */}
          <div className="chart-container" style={{ marginBottom: 24 }}>
            <h3 className="chart-title">Phân bố theo giờ trong ngày</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 140 }}>
              {Object.entries(data.hourlyStats).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([hour, count]) => {
                const maxH = Math.max(...Object.values(data.hourlyStats), 1);
                const isPeak = count === maxH && count > 0;
                return (
                  <div key={hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: '0.6rem', color: isPeak ? 'var(--gold)' : 'var(--text-muted)', fontWeight: isPeak ? 700 : 400 }}>{count || ''}</span>
                    <div style={{ width: '100%', maxWidth: 28, height: `${(count / maxH) * 110}px`, background: isPeak ? 'var(--gold)' : 'var(--accent-indigo)', borderRadius: '3px 3px 0 0', minHeight: count > 0 ? 4 : 1, opacity: count > 0 ? 1 : 0.2, transition: 'height 0.5s' }} />
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{hour}h</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* UTM Chiến dịch (nếu có) */}
          {Object.keys(data.utmSourceStats).length > 0 && (
            <div className="analytics-detail-grid" style={{ marginBottom: 24 }}>
              <div className="chart-container">
                <h3 className="chart-title">Nguồn chiến dịch (UTM Source)</h3>
                {Object.entries(data.utmSourceStats).sort(([, a], [, b]) => b - a).map(([src, count]) => {
                  const max = Math.max(...Object.values(data.utmSourceStats));
                  return <BarRow key={src} label={src} value={count} max={max} color="var(--accent-green)" />;
                })}
              </div>
              {Object.keys(data.utmMediumStats).length > 0 && (
                <div className="chart-container">
                  <h3 className="chart-title">Kênh quảng cáo (UTM Medium)</h3>
                  {Object.entries(data.utmMediumStats).sort(([, a], [, b]) => b - a).map(([med, count]) => {
                    const max = Math.max(...Object.values(data.utmMediumStats));
                    return <BarRow key={med} label={med} value={count} max={max} color="var(--accent-amber)" />;
                  })}
                </div>
              )}
              {Object.keys(data.utmCampaignStats).length > 0 && (
                <div className="chart-container">
                  <h3 className="chart-title">Tên chiến dịch (UTM Campaign)</h3>
                  {Object.entries(data.utmCampaignStats).sort(([, a], [, b]) => b - a).map(([camp, count]) => {
                    const max = Math.max(...Object.values(data.utmCampaignStats));
                    return <BarRow key={camp} label={camp} value={count} max={max} color="var(--accent-red)" />;
                  })}
                </div>
              )}
            </div>
          )}

          {/* Bảng chi tiết */}
          <div className="chart-container" style={{ marginBottom: 24 }}>
            <h3 className="chart-title">Chi tiết tương tác theo trang</h3>
            <div className="analytics-table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Trang</th>
                    {Object.values(EVENT_LABELS).map(l => <th key={l}>{l}</th>)}
                    <th>Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.byPage).map(([page, events]) => {
                    const total = Object.values(events).reduce((a, b) => a + b, 0);
                    return (
                      <tr key={page}>
                        <td style={{ fontWeight: 600, color: page === 'elite_presence' ? 'var(--gold)' : page === 'teen_etiquette' ? 'var(--accent-indigo)' : 'var(--accent-amber)', whiteSpace: 'nowrap' }}>
                          {SOURCE_LABELS[page] || page}
                        </td>
                        {Object.keys(EVENT_LABELS).map(ev => (
                          <td key={ev} style={{ color: 'var(--text-secondary)' }}>{events[ev] || 0}</td>
                        ))}
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Biểu đồ truy cập theo ngày */}
          <div className="chart-container">
            <h3 className="chart-title">
              Lượt truy cập theo ngày
              <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
                ({fromDate} → {toDate})
              </span>
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 200, overflowX: 'auto', overflowY: 'hidden' }}>
              {Object.entries(data.byDay).sort(([a], [b]) => a.localeCompare(b)).map(([day, count]) => {
                const maxDay = Math.max(...Object.values(data.byDay), 1);
                return (
                  <div key={day} style={{ flex: '0 0 auto', minWidth: 20, maxWidth: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{count}</span>
                    <div style={{ width: '100%', height: `${(count / maxDay) * 160}px`, background: 'linear-gradient(to top, var(--gold-dark), var(--gold))', borderRadius: '4px 4px 0 0', minHeight: 4, transition: 'height 0.5s' }} />
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 40 }}>{day.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

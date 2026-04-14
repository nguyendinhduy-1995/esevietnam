'use client';
import { useState, useEffect, useCallback } from 'react';
import { SOURCE_LABELS, STATUS_LABELS, timeAgo } from '@/lib/utils';

const PIPELINE_STAGES = ['NEW', 'CONTACTED', 'APPOINTED', 'CONVERTED', 'LOST'];
const STAGE_COLORS: Record<string, string> = { NEW: '#6366f1', CONTACTED: '#f59e0b', APPOINTED: '#3b82f6', CONVERTED: '#10b981', LOST: '#ef4444' };

interface Lead { id: string; name: string; phone: string; source: string; status: string; childName: string | null; package: string | null; assignedTo: { name: string } | null; createdAt: string; }

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/leads?limit=200');
    const data = await res.json();
    setLeads(data.leads || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const moveCard = async (leadId: string, newStatus: string) => {
    await fetch(`/api/leads/${leadId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
  };

  return (
    <div>
      <div className="page-toolbar">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', flex: 1 }}>Kéo thả hoặc chọn để di chuyển lead qua các giai đoạn</p>
        <button className="btn btn-secondary btn-sm" onClick={fetchAll}>Làm mới</button>
      </div>

      <div className={`pipeline-board ${loading ? 'data-loading' : ''}`}>
        {PIPELINE_STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.status === stage);
          return (
            <div key={stage} className="pipeline-column">
              <div className="pipeline-header" style={{ borderBottom: `2px solid ${STAGE_COLORS[stage]}` }}>
                <h4 style={{ color: STAGE_COLORS[stage] }}>{STATUS_LABELS[stage]}</h4>
                <span className="pipeline-count">{stageLeads.length}</span>
              </div>
              <div className="pipeline-body">
                {stageLeads.map(lead => (
                  <div key={lead.id} className="pipeline-card">
                    <div className="pipeline-card-name">{lead.name}</div>
                    <div className="pipeline-card-phone">
                      <a href={`tel:${lead.phone}`} style={{ color: 'var(--gold)' }}>{lead.phone}</a>
                    </div>
                    {lead.childName && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>Con: {lead.childName}</div>}
                    <div className="pipeline-card-meta">
                      <span className={`badge ${lead.source === 'elite_presence' ? 'badge-elite' : lead.source === 'teen_etiquette' ? 'badge-teen' : 'badge-kid'}`} style={{ fontSize: '0.65rem' }}>
                        {SOURCE_LABELS[lead.source]}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{timeAgo(lead.createdAt)}</span>
                    </div>
                    {lead.assignedTo && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 8 }}>→ {lead.assignedTo.name}</div>}
                    {/* Move buttons */}
                    <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
                      {PIPELINE_STAGES.filter(s => s !== stage).map(s => (
                        <button key={s} className="btn btn-secondary" onClick={() => moveCard(lead.id, s)}
                          style={{ padding: '3px 8px', fontSize: '0.65rem', borderColor: STAGE_COLORS[s], color: STAGE_COLORS[s] }}>
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Chưa có lead</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';
import { SOURCE_LABELS, STATUS_LABELS, timeAgo } from '@/lib/utils';

interface Lead {
  id: string; name: string; phone: string; childName: string | null; childAge: number | null;
  source: string; package: string | null; message: string | null; status: string;
  assignedTo: { id: string; name: string } | null;
  _count: { calls: number; notes: number };
  createdAt: string; lostReason: string | null;
}

interface LeadNote { id: string; content: string; createdAt: string; user: { name: string } }
interface LeadDetailEvent { id: string; type: string; payload: string | null; createdAt: string; createdBy: { name: string } | null }
interface LeadDetail {
  id: string; name: string; phone: string; childName: string | null; childAge: number | null;
  source: string; package: string | null; message: string | null; status: string;
  notes: LeadNote[]; events: LeadDetailEvent[];
}

interface User { id: string; name: string; }

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<LeadDetail | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [noteText, setNoteText] = useState('');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), status: statusFilter, source: sourceFilter });
    if (search) params.set('search', search);
    const res = await fetch(`/api/leads?${params}`);
    const data = await res.json();
    setLeads(data.leads || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }, [page, statusFilter, sourceFilter, search]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => setUsers(d.users || []));
  }, []);

  const openDetail = async (id: string) => {
    setShowDetail(id);
    const res = await fetch(`/api/leads/${id}`);
    const data = await res.json();
    setDetailData(data.lead);
  };

  const updateLead = async (id: string, updates: Record<string, unknown>) => {
    await fetch(`/api/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    fetchLeads();
    if (showDetail === id) openDetail(id);
  };

  const addNote = async () => {
    if (!noteText.trim() || !showDetail) return;
    await fetch(`/api/leads/${showDetail}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: noteText }) });
    setNoteText('');
    openDetail(showDetail);
  };

  const detail = detailData;
  const detailNotes = detail?.notes || [];
  const detailEvents = detail?.events || [];

  return (
    <div>
      {/* Toolbar */}
      <div className="page-toolbar">
        <input className="form-input" placeholder="Tìm kiếm tên, SĐT..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="ALL">Tất cả trạng thái</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="form-select" value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPage(1); }}>
          <option value="ALL">Tất cả nguồn</option>
          {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="page-toolbar-spacer" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{total} lead</span>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Thêm Lead</button>
      </div>

      {/* Table */}
      <div className={`card ${loading ? 'data-loading' : ''}`} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên</th><th>SĐT</th><th>Nguồn</th><th>Trạng thái</th><th>Phụ trách</th><th>Ghi chú</th><th>Thời gian</th><th></th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} onClick={() => openDetail(lead.id)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {lead.name}
                    {lead.childName && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Con: {lead.childName}{lead.childAge ? ` (${lead.childAge} tuổi)` : ''}</div>}
                  </td>
                  <td><a href={`tel:${lead.phone}`} style={{ color: 'var(--gold)' }} onClick={e => e.stopPropagation()}>{lead.phone}</a></td>
                  <td><span className={`badge ${lead.source === 'elite_presence' ? 'badge-elite' : lead.source === 'teen_etiquette' ? 'badge-teen' : 'badge-kid'}`}>{SOURCE_LABELS[lead.source]}</span></td>
                  <td>
                    <select className="form-select" value={lead.status} onClick={e => e.stopPropagation()}
                      onChange={e => updateLead(lead.id, { status: e.target.value })}
                      style={{ padding: '4px 28px 4px 8px', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--border)', minWidth: 130 }}>
                      {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className="form-select" value={lead.assignedTo?.id || ''} onClick={e => e.stopPropagation()}
                      onChange={e => updateLead(lead.id, { assignedId: e.target.value })}
                      style={{ padding: '4px 28px 4px 8px', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--border)', minWidth: 120 }}>
                      <option value="">Chưa phân</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lead._count.notes} ghi chú · {lead._count.calls} cuộc gọi</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{timeAgo(lead.createdAt)}</td>
                  <td><button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); openDetail(lead.id); }}>Chi tiết</button></td>
                </tr>
              ))}
              {leads.length === 0 && !loading && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Không có lead nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && <CreateLeadModal users={users} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchLeads(); }} />}

      {/* Detail Modal */}
      {showDetail && detail && (
        <div className="modal-overlay" onClick={() => { setShowDetail(null); setDetailData(null); }}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{detail.name || 'Lead'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => { setShowDetail(null); setDetailData(null); }}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div><span className="form-label">SĐT</span><p style={{ color: 'var(--gold)' }}>{detail.phone}</p></div>
                <div><span className="form-label">Nguồn</span><p>{SOURCE_LABELS[detail.source] || detail.source}</p></div>
                {detail.childName && <div><span className="form-label">Tên con</span><p>{detail.childName}</p></div>}
                {detail.childAge && <div><span className="form-label">Tuổi con</span><p>{detail.childAge}</p></div>}
                {detail.package && <div><span className="form-label">Gói</span><p>{detail.package}</p></div>}
                {detail.message && <div style={{ gridColumn: '1 / -1' }}><span className="form-label">Tin nhắn</span><p>{detail.message}</p></div>}
              </div>

              {/* Add Note */}
              <div style={{ marginBottom: 20 }}>
                <span className="form-label">Thêm ghi chú</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" placeholder="Nhập ghi chú..." value={noteText} onChange={e => setNoteText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addNote()} />
                  <button className="btn btn-primary btn-sm" onClick={addNote}>Gửi</button>
                </div>
              </div>

              {/* Timeline */}
              <span className="form-label">Lịch sử hoạt động</span>
              <div className="timeline" style={{ marginTop: 8 }}>
                {detailNotes.map(n => (
                  <div key={n.id} className="timeline-item">
                    <div className="timeline-time">{timeAgo(n.createdAt)} · {n.user.name}</div>
                    <div className="timeline-content">{n.content}</div>
                  </div>
                ))}
                {detailEvents.map(e => (
                  <div key={e.id} className="timeline-item">
                    <div className="timeline-time">{timeAgo(e.createdAt)} · {e.createdBy?.name || 'Hệ thống'}</div>
                    <div className="timeline-content" style={{ fontSize: '0.8rem' }}>
                      {e.type === 'STATUS_CHANGE' && (() => { try { const p = JSON.parse(e.payload || '{}'); return `Trạng thái: ${STATUS_LABELS[p.from] || p.from || '—'} → ${STATUS_LABELS[p.to] || p.to}`; } catch { return e.type; } })()}
                      {e.type === 'ASSIGNMENT' && 'Phân công nhân sự'}
                      {e.type === 'NOTE' && 'Thêm ghi chú'}
                      {e.type === 'CALL' && 'Ghi nhận cuộc gọi'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateLeadModal({ users, onClose, onCreated }: { users: User[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', source: 'elite_presence', childName: '', childAge: '', package: '', message: '', assignedId: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }
    onCreated();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Thêm Lead Mới</h3><button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button></div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Họ tên *</label><input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">SĐT *</label><input className="form-input" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0901234567" /></div>
              <div className="form-group"><label className="form-label">Nguồn *</label>
                <select className="form-select" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                  {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Gói</label><input className="form-input" value={form.package} onChange={e => setForm({ ...form, package: e.target.value })} placeholder="Essential, Premium..." /></div>
              <div className="form-group"><label className="form-label">Tên con</label><input className="form-input" value={form.childName} onChange={e => setForm({ ...form, childName: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Tuổi con</label><input className="form-input" type="number" value={form.childAge} onChange={e => setForm({ ...form, childAge: e.target.value })} /></div>
            </div>
            <div className="form-group"><label className="form-label">Phân công</label>
              <select className="form-select" value={form.assignedId} onChange={e => setForm({ ...form, assignedId: e.target.value })}>
                <option value="">Chưa phân</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Ghi chú</label><textarea className="form-textarea" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Tạo Lead'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}



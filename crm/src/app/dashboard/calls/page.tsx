'use client';
import { useState, useEffect, useCallback } from 'react';
import { CALL_OUTCOME_LABELS, timeAgo } from '@/lib/utils';

interface CallRecord {
  id: string; leadId: string; audioPath: string | null; duration: number | null;
  transcript: string | null; aiScore: number | null; aiAnalysis: string | null;
  outcome: string; notes: string | null; createdAt: string;
  lead: { name: string; phone: string }; staff: { name: string };
}

interface Lead { id: string; name: string; phone: string; }

interface AnalysisCriteria { score: number; comment: string; }
interface AnalysisResult {
  score: number;
  summary: string;
  criteria?: Record<string, AnalysisCriteria>;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  error?: string;
}

export default function CallsPage() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState<CallRecord | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  const fetchCalls = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/calls');
    const data = await res.json();
    setCalls(data.calls || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCalls(); }, [fetchCalls]);

  const analyzeCall = async (call: CallRecord) => {
    setShowAnalysis(call);
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await fetch(`/api/calls/${call.id}/analyze`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setAnalysisResult(data.analysis);
        fetchCalls();
      } else {
        setAnalysisResult({ error: data.error, score: 0, summary: '' } as AnalysisResult);
      }
    } catch {
      setAnalysisResult({ error: 'Lỗi kết nối', score: 0, summary: '' } as AnalysisResult);
    }
    setAnalyzing(false);
  };

  const getScoreClass = (score: number | null) => {
    if (!score) return '';
    if (score >= 7) return 'score-high';
    if (score >= 4) return 'score-mid';
    return 'score-low';
  };

  return (
    <div>
      <div className="page-toolbar">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', flex: 1 }}>Upload ghi âm cuộc gọi, chuyển giọng nói thành văn bản và phân tích AI</p>
        <button className="btn btn-primary" onClick={() => { setShowUpload(true); fetch('/api/leads?limit=100').then(r => r.json()).then(d => setLeads(d.leads || [])); }}>+ Tải lên ghi âm</button>
      </div>

      <div className={`card ${loading ? 'data-loading' : ''}`} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Lead</th><th>SĐT</th><th>Kết quả</th><th>Nhân viên</th><th>Ghi âm</th><th>Điểm AI</th><th>Thời gian</th><th></th></tr>
            </thead>
            <tbody>
              {calls.map(call => (
                <tr key={call.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{call.lead.name}</td>
                  <td><a href={`tel:${call.lead.phone}`} style={{ color: 'var(--gold)' }}>{call.lead.phone}</a></td>
                  <td><span className={`badge badge-${call.outcome === 'CONNECTED' ? 'converted' : call.outcome === 'NO_ANSWER' || call.outcome === 'BUSY' ? 'contacted' : call.outcome === 'WRONG_NUMBER' ? 'lost' : 'new'}`}>
                    {CALL_OUTCOME_LABELS[call.outcome]}
                  </span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{call.staff.name}</td>
                  <td>{call.audioPath ? <a href={call.audioPath} target="_blank" style={{ color: 'var(--accent-blue)', fontSize: '0.85rem' }}>▶ Nghe</a> : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>}</td>
                  <td>{call.aiScore !== null ? <span className={`score-badge ${getScoreClass(call.aiScore)}`} style={{ width: 36, height: 36, fontSize: '0.85rem' }}>{call.aiScore}</span> : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{timeAgo(call.createdAt)}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => {
                      if (call.aiAnalysis) { setShowAnalysis(call); setAnalysisResult(JSON.parse(call.aiAnalysis)); }
                      else analyzeCall(call);
                    }}>
                      {call.aiAnalysis ? 'Xem phân tích' : 'Phân tích AI'}
                    </button>
                  </td>
                </tr>
              ))}
              {calls.length === 0 && !loading && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Chưa có ghi âm nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && <UploadCallModal leads={leads} onClose={() => setShowUpload(false)} onUploaded={() => { setShowUpload(false); fetchCalls(); }} />}

      {/* Analysis Modal */}
      {showAnalysis && (
        <div className="modal-overlay" onClick={() => { setShowAnalysis(null); setAnalysisResult(null); }}>
          <div className="modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Phân tích cuộc gọi — {showAnalysis.lead.name}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => { setShowAnalysis(null); setAnalysisResult(null); }}>✕</button>
            </div>
            <div className="modal-body">
              {analyzing && <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto 16px' }} /><p style={{ color: 'var(--text-muted)' }}>Đang phân tích bằng AI...</p></div>}
              {analysisResult && !analysisResult.error && (
                <div>
                  {/* Overall Score */}
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div className={`score-badge ${getScoreClass(analysisResult.score)}`} style={{ width: 80, height: 80, fontSize: '1.8rem', margin: '0 auto 8px' }}>{analysisResult.score}</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{analysisResult.summary}</p>
                  </div>

                  {/* Criteria */}
                  {analysisResult.criteria && (
                    <div style={{ marginBottom: 24 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12, color: 'var(--gold)' }}>Tiêu chí đánh giá</h4>
                      {Object.entries(analysisResult.criteria || {}).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 8 }}>
                          <span className={`score-badge ${getScoreClass(val.score)}`} style={{ width: 32, height: 32, fontSize: '0.75rem', flexShrink: 0 }}>{val.score}</span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>{key === 'greeting' ? 'Lời chào' : key === 'tone' ? 'Giọng điệu' : key === 'product_knowledge' ? 'Kiến thức SP' : key === 'objection_handling' ? 'Xử lý phản bác' : 'Chốt deal'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{val.comment}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid-2">
                    {/* Strengths */}
                    <div><h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, color: 'var(--accent-green)' }}>Điểm mạnh</h4>
                      {analysisResult.strengths?.map((s, i) => <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>✓ {s}</div>)}
                    </div>
                    {/* Weaknesses */}
                    <div><h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, color: 'var(--accent-red)' }}>Điểm yếu</h4>
                      {analysisResult.weaknesses?.map((w, i) => <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>✗ {w}</div>)}
                    </div>
                  </div>

                  {/* Suggestions */}
                  {(analysisResult.suggestions?.length || 0) > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, color: 'var(--accent-blue)' }}>Gợi ý cải thiện</h4>
                      {analysisResult.suggestions?.map((s, i) => <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>→ {s}</div>)}
                    </div>
                  )}

                  {/* Transcript */}
                  {showAnalysis.transcript && (
                    <div style={{ marginTop: 20 }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>Nội dung cuộc gọi</h4>
                      <div style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 8, fontSize: '0.85rem', color: 'var(--text-secondary)', maxHeight: 200, overflowY: 'auto', lineHeight: 1.6 }}>
                        {showAnalysis.transcript}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {analysisResult?.error && (
                <div className="login-error">{analysisResult.error}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadCallModal({ leads, onClose, onUploaded }: { leads: Lead[]; onClose: () => void; onUploaded: () => void }) {
  const [leadId, setLeadId] = useState('');
  const [outcome, setOutcome] = useState('CONNECTED');
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) { setError('Chọn lead'); return; }
    setSaving(true);
    setError('');

    const formData = new FormData();
    formData.append('leadId', leadId);
    formData.append('outcome', outcome);
    formData.append('notes', notes);
    formData.append('duration', duration);
    if (file) formData.append('audio', file);

    const res = await fetch('/api/calls', { method: 'POST', body: formData });
    if (!res.ok) { const d = await res.json(); setError(d.error); setSaving(false); return; }
    onUploaded();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Tải lên ghi âm cuộc gọi</h3><button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button></div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}
            <div className="form-group"><label className="form-label">Lead *</label>
              <select className="form-select" value={leadId} onChange={e => setLeadId(e.target.value)} required>
                <option value="">Chọn lead...</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.name} — {l.phone}</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Kết quả cuộc gọi</label>
                <select className="form-select" value={outcome} onChange={e => setOutcome(e.target.value)}>
                  {Object.entries(CALL_OUTCOME_LABELS).filter(([k]) => k !== 'PENDING').map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Thời lượng (giây)</label>
                <input className="form-input" type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="120" />
              </div>
            </div>
            <div className="form-group"><label className="form-label">File ghi âm (MP3, WAV, M4A)</label>
              <input type="file" accept="audio/*" onChange={e => setFile(e.target.files?.[0] || null)}
                style={{ display: 'block', padding: 12, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', width: '100%' }} />
            </div>
            <div className="form-group"><label className="form-label">Ghi chú</label>
              <textarea className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Ghi chú về cuộc gọi..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang tải...' : 'Lưu cuộc gọi'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

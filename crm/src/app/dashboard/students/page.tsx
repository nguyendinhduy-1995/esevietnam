'use client';
import { useState, useEffect, useCallback } from 'react';
import { SOURCE_LABELS, STUDENT_STATUS_LABELS, formatVND, formatDate } from '@/lib/utils';

interface Student {
  id: string; leadId: string; parentName: string; childName: string | null; phone: string;
  program: string; package: string; status: string; startDate: string | null; endDate: string | null;
  totalFee: number; paidAmount: number; createdAt: string;
  payments: { id: string; amount: number; method: string; note: string | null; createdAt: string }[];
  _count: { schedules: number; notes: number };
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('ALL');
  const [showDetail, setShowDetail] = useState<Student | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [payNote, setPayNote] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ program: programFilter });
    if (search) params.set('search', search);
    const res = await fetch(`/api/students?${params}`);
    const data = await res.json();
    setStudents(data.students || []);
    setLoading(false);
  }, [search, programFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const addPayment = async () => {
    if (!showDetail || !payAmount) return;
    const res = await fetch(`/api/students/${showDetail.id}/payments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: payAmount, method: payMethod, note: payNote }),
    });
    if (res.ok) { setShowPayment(false); setPayAmount(''); setPayNote(''); fetchStudents(); setShowDetail(null); }
  };

  const getPaymentStatus = (s: Student) => {
    if (s.paidAmount >= s.totalFee) return { label: 'Đã thanh toán', color: 'var(--accent-green)' };
    if (s.paidAmount > 0) return { label: 'Đang trả', color: 'var(--accent-amber)' };
    return { label: 'Chưa thanh toán', color: 'var(--accent-red)' };
  };

  return (
    <div>
      <div className="page-toolbar">
        <input className="form-input" placeholder="Tìm theo tên, SĐT..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" value={programFilter} onChange={e => setProgramFilter(e.target.value)}>
          <option value="ALL">Tất cả chương trình</option>
          {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="page-toolbar-spacer" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{students.length} học viên</span>
      </div>

      <div className={`card ${loading ? 'data-loading' : ''}`} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Phụ huynh</th><th>Học viên</th><th>SĐT</th><th>Chương trình</th><th>Gói</th><th>Trạng thái</th><th>Thanh toán</th><th></th></tr>
            </thead>
            <tbody>
              {students.map(s => {
                const pay = getPaymentStatus(s);
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.parentName}</td>
                    <td>{s.childName || '—'}</td>
                    <td><a href={`tel:${s.phone}`} style={{ color: 'var(--gold)' }}>{s.phone}</a></td>
                    <td><span className={`badge ${s.program === 'elite_presence' ? 'badge-elite' : s.program === 'teen_etiquette' ? 'badge-teen' : 'badge-kid'}`}>{SOURCE_LABELS[s.program]}</span></td>
                    <td style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{s.package}</td>
                    <td><span className={`badge badge-${s.status === 'ACTIVE' ? 'converted' : s.status === 'COMPLETED' ? 'appointed' : s.status === 'SUSPENDED' ? 'lost' : 'new'}`}>{STUDENT_STATUS_LABELS[s.status]}</span></td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: pay.color, fontWeight: 600 }}>{formatVND(s.paidAmount)}</span>
                        <span style={{ color: 'var(--text-muted)' }}> / {formatVND(s.totalFee)}</span>
                      </div>
                    </td>
                    <td><button className="btn btn-secondary btn-sm" onClick={() => setShowDetail(s)}>Chi tiết</button></td>
                  </tr>
                );
              })}
              {students.length === 0 && !loading && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Chưa có học viên nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => { setShowDetail(null); setShowPayment(false); }}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{showDetail.childName || showDetail.parentName}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => { setShowDetail(null); setShowPayment(false); }}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div><span className="form-label">Phụ huynh</span><p>{showDetail.parentName}</p></div>
                <div><span className="form-label">SĐT</span><p style={{ color: 'var(--gold)' }}>{showDetail.phone}</p></div>
                <div><span className="form-label">Chương trình</span><p>{SOURCE_LABELS[showDetail.program]}</p></div>
                <div><span className="form-label">Gói</span><p style={{ textTransform: 'capitalize' }}>{showDetail.package}</p></div>
                <div><span className="form-label">Trạng thái</span><p>{STUDENT_STATUS_LABELS[showDetail.status]}</p></div>
                <div><span className="form-label">Ngày bắt đầu</span><p>{showDetail.startDate ? formatDate(showDetail.startDate) : '—'}</p></div>
              </div>

              {/* Payment Summary */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>Thanh toán</span>
                  <span style={{ color: getPaymentStatus(showDetail).color, fontWeight: 600 }}>{getPaymentStatus(showDetail).label}</span>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', width: `${Math.min((showDetail.paidAmount / showDetail.totalFee) * 100, 100)}%`, background: 'var(--accent-green)', borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Đã trả: {formatVND(showDetail.paidAmount)}</span>
                  <span style={{ color: 'var(--text-muted)' }}>Tổng: {formatVND(showDetail.totalFee)}</span>
                </div>
                {showDetail.paidAmount < showDetail.totalFee && (
                  <div style={{ marginTop: 8, textAlign: 'right' }}>
                    <span style={{ color: 'var(--accent-amber)', fontSize: '0.85rem', fontWeight: 600 }}>
                      Còn nợ: {formatVND(showDetail.totalFee - showDetail.paidAmount)}
                    </span>
                  </div>
                )}
              </div>

              {/* Add Payment */}
              {!showPayment ? (
                <button className="btn btn-primary btn-sm" onClick={() => setShowPayment(true)}>+ Ghi nhận thanh toán</button>
              ) : (
                <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 16 }}>
                  <div className="grid-2" style={{ gap: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Số tiền</label>
                      <input className="form-input" type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="1000000" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Phương thức</label>
                      <select className="form-select" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                        <option value="cash">Tiền mặt</option>
                        <option value="transfer">Chuyển khoản</option>
                        <option value="card">Thẻ</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: 12, marginBottom: 0 }}><label className="form-label">Ghi chú</label>
                    <input className="form-input" value={payNote} onChange={e => setPayNote(e.target.value)} placeholder="Đợt 1, Đợt 2..." />
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowPayment(false)}>Hủy</button>
                    <button className="btn btn-primary btn-sm" onClick={addPayment}>Lưu</button>
                  </div>
                </div>
              )}

              {/* Payment History */}
              {showDetail.payments.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>Lịch sử thanh toán</h4>
                  {showDetail.payments.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>{formatVND(p.amount)}</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{p.method === 'cash' ? 'Tiền mặt' : p.method === 'transfer' ? 'CK' : 'Thẻ'}</span>
                        {p.note && <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>— {p.note}</span>}
                      </div>
                      <span style={{ color: 'var(--text-muted)' }}>{formatDate(p.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
interface User { id: string; username: string; name: string; role: string; email: string | null; phone: string | null; active: boolean; }

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [fbPixelId, setFbPixelId] = useState('');
  const [gaId, setGaId] = useState('');
  const [trackingSaved, setTrackingSaved] = useState(false);

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => setUsers(d.users || []));
    fetch('/api/settings/openai').then(r => r.json()).then(d => setApiKey(d.hasKey ? '••••••••••••••••' : ''));
    fetch('/api/settings/tracking').then(r => r.json()).then(d => {
      setFbPixelId(d.fbPixelId || '');
      setGaId(d.gaId || '');
    }).catch(() => {/* new endpoint, may not exist yet */});
  }, []);

  const saveApiKey = async () => {
    await fetch('/api/settings/openai', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 3000);
  };

  const saveTracking = async () => {
    await fetch('/api/settings/tracking', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fbPixelId, gaId }),
    });
    setTrackingSaved(true);
    setTimeout(() => setTrackingSaved(false), 3000);
  };

  return (
    <div>
      {/* Mã theo dõi quảng cáo */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Mã theo dõi quảng cáo</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
          Gắn mã Facebook Pixel và Google Analytics vào các trang Landing Page để theo dõi hiệu quả chiến dịch quảng cáo.
        </p>

        <div className="settings-tracking-grid">
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Facebook Pixel ID</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '-0.5px' }}>f</div>
              <input className="form-input" value={fbPixelId} onChange={e => setFbPixelId(e.target.value)} placeholder="Ví dụ: 123456789012345" style={{ flex: 1 }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
              Tìm Pixel ID tại: Meta Business Suite → Quản lý sự kiện → Nguồn dữ liệu
            </p>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Google Analytics (GA4) Measurement ID</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>G</div>
              <input className="form-input" value={gaId} onChange={e => setGaId(e.target.value)} placeholder="Ví dụ: G-XXXXXXXXXX" style={{ flex: 1 }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
              Tìm Measurement ID tại: Google Analytics → Quản trị → Luồng dữ liệu
            </p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={saveTracking} style={{ marginTop: 8 }}>Lưu mã theo dõi</button>
        {trackingSaved && <div className="toast">✓ Đã lưu mã theo dõi</div>}
      </div>

      {/* Cấu hình AI */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Cấu hình AI (OpenAI)</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
          Cần thiết cho tính năng chuyển giọng nói thành văn bản và phân tích cuộc gọi tự động.
        </p>
        <div className="settings-ai-row">
          <div style={{ flex: 1 }}>
            <label className="form-label">OpenAI API Key</label>
            <input className="form-input" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-..." />
          </div>
          <button className="btn btn-primary" onClick={saveApiKey} style={{ alignSelf: 'flex-end' }}>Lưu</button>
        </div>
        {apiKeySaved && <div className="toast">✓ Đã lưu API key</div>}
      </div>

      {/* Quản lý nhân sự */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Quản lý nhân sự</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ Thêm nhân viên</button>
        </div>
        <div className="analytics-table-scroll">
          <table className="data-table">
            <thead>
              <tr><th>Tên</th><th>Tài khoản</th><th>Vai trò</th><th>Email</th><th>SĐT</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{u.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.username}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'badge-elite' : u.role === 'manager' ? 'badge-teen' : 'badge-kid'}`} style={{ textTransform: 'capitalize' }}>{u.role === 'admin' ? 'Quản trị' : u.role === 'manager' ? 'Quản lý' : 'Nhân viên'}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.phone || '—'}</td>
                  <td><span className={`badge ${u.active ? 'badge-converted' : 'badge-lost'}`}>{u.active ? 'Hoạt động' : 'Vô hiệu'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetch('/api/users').then(r => r.json()).then(d => setUsers(d.users || [])); }} />}
    </div>
  );
}

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'staff', email: '', phone: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/users/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }
    onCreated();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Thêm nhân viên</h3><button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button></div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="login-error">{error}</div>}
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Họ tên *</label><input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Tài khoản *</label><input className="form-input" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Mật khẩu *</label><input className="form-input" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Vai trò</label>
                <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="staff">Nhân viên</option>
                  <option value="manager">Quản lý</option>
                  <option value="admin">Quản trị</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">SĐT</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang tạo...' : 'Tạo'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Đăng nhập thất bại');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Decorative elements */}
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />
      <div className="login-bg-orb login-bg-orb-3" />
      <div className="login-grid-pattern" />

      <div className="login-wrapper">
        {/* Left brand panel - desktop only */}
        <div className="login-brand-panel">
          <div className="login-brand-content">
            <div className="login-logo-wrapper">
              <div className="login-logo">E</div>
              <div className="login-logo-glow" />
            </div>
            <h1 className="login-hero-title">ESE VIETNAM</h1>
            <p className="login-hero-subtitle">Trường Nghi Thức Xuất Sắc Việt Nam</p>
            <div className="login-divider" />
            <p className="login-hero-desc">
              Hệ thống quản lý khách hàng & vận hành toàn diện cho các chương trình đào tạo Nghi Thức Quốc Tế.
            </p>
            <div className="login-features">
              <div className="login-feature-item">
                <span>Quản lý khách hàng tiềm năng</span>
              </div>
              <div className="login-feature-item">
                <span>Phân tích dữ liệu thông minh</span>
              </div>
              <div className="login-feature-item">
                <span>Quản lý học viên & lịch học</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right login form panel */}
        <div className="login-form-panel">
          <div className="login-form-container">
            {/* Mobile logo */}
            <div className="login-mobile-brand">
              <div className="login-logo">E</div>
              <h1>ESE VIETNAM</h1>
              <p>Hệ thống quản lý CRM</p>
            </div>

            <div className="login-form-header">
              <h2>Đăng nhập</h2>
              <p>Vui lòng nhập thông tin tài khoản của bạn</p>
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Tên đăng nhập</label>
                <input
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu</label>
                <div className="login-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: 42 }}
                  />
                  <button type="button" className="login-password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    <span>Đang xử lý...</span>
                  </>
                ) : 'Đăng Nhập'}
              </button>
            </form>

            <p className="login-footer-text">
              Trường Nghi Thức Xuất Sắc Việt Nam © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

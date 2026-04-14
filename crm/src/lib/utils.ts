export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 30) return `${days} ngày trước`;
  return formatDate(date);
}

export const SOURCE_LABELS: Record<string, string> = {
  elite_presence: 'Élite Presence',
  teen_etiquette: 'Teen Etiquette',
  kidiquette: 'Kidiquette',
};

export const STATUS_LABELS: Record<string, string> = {
  NEW: 'Mới',
  CONTACTED: 'Đã liên hệ',
  APPOINTED: 'Có lịch hẹn',
  CONVERTED: 'Đã chuyển đổi',
  LOST: 'Đã mất',
};

export const STATUS_COLORS: Record<string, string> = {
  NEW: '#6366f1',
  CONTACTED: '#f59e0b',
  APPOINTED: '#3b82f6',
  CONVERTED: '#10b981',
  LOST: '#ef4444',
};

export const STUDENT_STATUS_LABELS: Record<string, string> = {
  ENROLLED: 'Đã đăng ký',
  ACTIVE: 'Đang học',
  COMPLETED: 'Hoàn thành',
  SUSPENDED: 'Tạm nghỉ',
};

export const CALL_OUTCOME_LABELS: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  CONNECTED: 'Đã kết nối',
  NO_ANSWER: 'Không nghe',
  BUSY: 'Máy bận',
  CALLBACK: 'Gọi lại',
  WRONG_NUMBER: 'Sai số',
};

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

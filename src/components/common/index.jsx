import { useState } from 'react';

export const Loader = ({ sm }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: sm ? 16 : 52 }}>
    <div className={`loader-ring ${sm ? 'loader-sm' : ''}`} />
  </div>
);

export const EmptyState = ({ icon = '📭', title, desc, action }) => (
  <div className="empty-state anim-fade">
    <div className="empty-icon">{icon}</div>
    <div className="empty-title">{title}</div>
    {desc && <div className="empty-desc">{desc}</div>}
    {action}
  </div>
);

export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ open, onClose, onConfirm, title, desc, danger, loading }) => (
  <Modal open={open} onClose={onClose} title={title}>
    <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 40 }}>{danger ? '⚠️' : '❓'}</div>
    <div style={{ color: 'var(--text-muted)', fontSize: 13.5, textAlign: 'center', marginBottom: 22, lineHeight: 1.6 }}>{desc}</div>
    <div className="flex gap-12">
      <button className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
      <button className={`btn btn-full ${danger ? 'btn-danger' : 'btn-primary'} ${loading ? 'btn-loading' : ''}`} onClick={onConfirm} disabled={loading}>
        <span className="btn-text">Confirm</span>
      </button>
    </div>
  </Modal>
);

export const Pagination = ({ current, total, onPage }) => {
  if (total <= 1) return null;
  const pages = Array.from({ length: Math.min(total, 7) }, (_, i) => i + 1);
  return (
    <div className="pagination">
      <button className="page-btn" disabled={current === 1} onClick={() => onPage(current - 1)}>‹</button>
      {pages.map((p) => <button key={p} className={`page-btn ${p === current ? 'active' : ''}`} onClick={() => onPage(p)}>{p}</button>)}
      {total > 7 && <button className={`page-btn ${total === current ? 'active' : ''}`} onClick={() => onPage(total)}>{total}</button>}
      <button className="page-btn" disabled={current === total} onClick={() => onPage(current + 1)}>›</button>
    </div>
  );
};

export const Toggle = ({ value, onChange }) => (
  <div className={`toggle ${value ? 'on' : ''}`} onClick={() => onChange(!value)} />
);

export const Input = ({ label, error, icon, type = 'text', ...props }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}</label>}
    <div className="input-wrap">
      {icon && <span className="input-icon">{icon}</span>}
      <input type={type} className={`form-control ${error ? 'error' : ''}`} {...props} />
    </div>
    {error && <span className="form-error">{error}</span>}
  </div>
);

export const PasswordInput = ({ label, error, ...props }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className="input-wrap">
        <span className="input-icon">🔒</span>
        <input type={show ? 'text' : 'password'} className={`form-control ${error ? 'error' : ''}`} {...props} />
        <span className="input-suffix" onClick={() => setShow(!show)}>{show ? '🙈' : '👁️'}</span>
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

export const Btn = ({ children, variant = 'primary', size, loading, full, onClick, type = 'button', disabled, className = '' }) => (
  <button type={type} onClick={onClick} disabled={disabled || loading}
    className={`btn btn-${variant} ${size ? `btn-${size}` : ''} ${full ? 'btn-full' : ''} ${loading ? 'btn-loading' : ''} ${className}`}>
    <span className="btn-text">{children}</span>
  </button>
);

export const Skeleton = ({ h = 14, mb = 10, w }) => (
  <div className="skeleton" style={{ height: h, marginBottom: mb, borderRadius: 7, width: w || '100%' }} />
);

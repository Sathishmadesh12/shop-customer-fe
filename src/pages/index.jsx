import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderService, walletService, notificationService, analyticsService } from '../services/index.js';
import { useAuth, useToast } from '../context/index.jsx';
import { getErr, fmt, fmtDate, fmtDateTime, fmtRelative, initials } from '../utils/index.js';
import { Loader, EmptyState, Pagination, PasswordInput, Input, Btn } from '../components/common/index.jsx';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { authService } from '../services/index.js';

const statusColor = { pending: 'var(--accent)', processing: 'var(--info)', completed: 'var(--success)', cancelled: 'var(--danger)' };

// ---- Orders List ----
export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    orderService.getAll({ page, limit: 10 })
      .then((r) => { setOrders(r.data.data?.orders || []); setTotalPages(r.data.data?.totalPages || 1); })
      .catch((e) => toast.error('Error', getErr(e)))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <Loader />;

  return (
    <div className="anim-up">
      <div className="page-header"><div><div className="page-title">My Orders 📦</div><div className="page-subtitle">Track all your orders</div></div></div>
      {orders.length === 0 ? (
        <EmptyState icon="📦" title="No orders yet" desc="Place your first order today!" action={<button className="btn btn-primary" onClick={() => navigate('/')}>Start Shopping</button>} />
      ) : (
        <div className="stagger">
          {orders.map((o) => (
            <div key={o._id} className="order-card" onClick={() => navigate(`/orders/${o._id}`)}>
              <div className="flex justify-between items-center">
                <div className="order-id">#{String(o._id).slice(-8).toUpperCase()}</div>
                <span className={`badge badge-${o.status}`}>{o.status}</span>
              </div>
              <div className="order-items-preview">{o.items?.map(i => i.name).join(', ')}</div>
              <div className="order-meta">
                <span className="text-muted text-xs">{fmtDate(o.createdAt)}</span>
                <span className="text-muted text-xs">•</span>
                <span className="text-muted text-xs">{o.paymentMethod?.toUpperCase()}</span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-d)', fontWeight: 800, color: 'var(--accent)' }}>{fmt(o.total)}</span>
              </div>
            </div>
          ))}
          <Pagination current={page} total={totalPages} onPage={setPage} />
        </div>
      )}
    </div>
  );
};

// ---- Order Detail ----
export const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    orderService.getById(id).then((r) => setOrder(r.data.data)).catch((e) => { toast.error('Error', getErr(e)); navigate('/orders'); }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!order) return null;

  return (
    <div className="anim-up" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="back-btn" onClick={() => navigate('/orders')}>← Back to Orders</div>
      <div className="flex justify-between items-center mb-16">
        <div className="page-title">Order Details</div>
        <button className="btn btn-ghost btn-sm no-print" onClick={() => navigate(`/orders/${id}/invoice`)}>🖨️ Invoice</button>
      </div>

      <div className="card mb-16">
        <div className="flex justify-between items-center">
          <div className="order-id">#{String(order._id).slice(-8).toUpperCase()}</div>
          <span className={`badge badge-${order.status}`}>{order.status}</span>
        </div>
        <div className="text-muted text-sm" style={{ marginTop: 6 }}>{fmtDateTime(order.createdAt)}</div>
        <div className="sep" />
        <div className="grid-2" style={{ gap: 12 }}>
          <div><div className="text-xs text-muted mb-8">PAYMENT</div><div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{order.paymentMethod}</div></div>
          <div><div className="text-xs text-muted mb-8">PAYMENT STATUS</div><span className={`badge badge-${order.paymentStatus}`}>{order.paymentStatus}</span></div>
        </div>
        {order.notes && <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--card2)', borderRadius: 8, fontSize: 13, color: 'var(--text-muted)' }}>📝 {order.notes}</div>}
      </div>

      <div className="card mb-16">
        <div className="card-title">Items Ordered</div>
        {order.items?.map((it, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div><div style={{ fontWeight: 600, fontSize: 14 }}>{it.name}</div><div className="text-muted text-xs">Qty: {it.quantity} × {fmt(it.offerPrice || it.price)}</div></div>
            <div style={{ fontFamily: 'var(--font-d)', fontWeight: 800, color: 'var(--accent)' }}>{fmt((it.offerPrice || it.price) * it.quantity)}</div>
          </div>
        ))}
        <div style={{ marginTop: 14 }}>
          {order.discount > 0 && <div className="summary-row discount"><span>Discount</span><span>-{fmt(order.discount)}</span></div>}
          {order.walletDeduction > 0 && <div className="summary-row" style={{ color: 'var(--primary-light)' }}><span>Wallet Used</span><span>-{fmt(order.walletDeduction)}</span></div>}
          <div className="summary-row total"><span>Total Paid</span><span className="summary-total-amt">{fmt(order.total)}</span></div>
        </div>
      </div>

      {order.statusHistory?.length > 0 && (
        <div className="card">
          <div className="card-title">Status History</div>
          {order.statusHistory.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor[h.status] || 'var(--text-muted)', flexShrink: 0, marginTop: 4 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>{h.status}</div>
                {h.note && <div className="text-muted text-xs">{h.note}</div>}
                <div className="text-xs text-muted">{fmtDateTime(h.at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---- Wallet Page ----
export const WalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  useEffect(() => {
    Promise.all([walletService.get(), walletService.getHistory({ page, limit: 15 })])
      .then(([w, h]) => { setWallet(w.data.data); setTransactions(h.data.data?.transactions || []); setTotalPages(h.data.data?.totalPages || 1); })
      .catch((e) => toast.error('Error', getErr(e)))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <Loader />;

  return (
    <div className="anim-up" style={{ maxWidth: 580, margin: '0 auto' }}>
      <div className="page-title mb-24">My Wallet 💰</div>
      <div className="wallet-balance-card">
        <div className="wallet-balance-icon">💰</div>
        <div className="wallet-balance-label">Available Balance</div>
        <div className="wallet-balance-amt">{fmt(wallet?.balance || 0)}</div>
      </div>
      <div className="card">
        <div className="card-title">Transaction History</div>
        {transactions.length === 0 ? <EmptyState icon="💸" title="No transactions yet" /> : (
          <>
            {transactions.map((t) => (
              <div key={t._id} className={`txn-item txn-${t.type}`}>
                <div className="txn-icon">{t.type === 'credit' ? '↓' : '↑'}</div>
                <div className="txn-desc">
                  <div className="txn-title">{t.description}</div>
                  <div className="txn-date">{fmtDateTime(t.createdAt)}</div>
                </div>
                <div className="txn-amount">{t.type === 'credit' ? '+' : '-'}{fmt(t.amount)}</div>
              </div>
            ))}
            <Pagination current={page} total={totalPages} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

// ---- Profile ----
export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    analyticsService.getSummary().then((r) => setSummary(r.data.data)).catch(() => {});
  }, []);

  const menuItems = [
    { icon: '✏️', label: 'Edit Profile', sub: 'Update name, phone, address', to: '/profile/edit' },
    { icon: '🔒', label: 'Change Password', sub: 'Update your password', to: '/profile/change-password' },
    { icon: '📦', label: 'My Orders', sub: 'View all past orders', to: '/orders' },
    { icon: '💰', label: 'Wallet', sub: `Balance: ${fmt(summary?.walletBalance || 0)}`, to: '/wallet' },
    { icon: '🔔', label: 'Notifications', sub: 'View notifications', to: '/notifications' },
  ];

  return (
    <div className="anim-up" style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="profile-hero">
        <div className="profile-avatar-lg">{initials(user?.name)}</div>
        <div style={{ flex: 1 }}>
          <div className="profile-name">{user?.name}</div>
          <div className="profile-email">{user?.email}</div>
          {summary && (
            <div className="profile-stats">
              <div className="profile-stat"><div className="profile-stat-val">{summary.totalOrders}</div><div className="profile-stat-label">Orders</div></div>
              <div className="profile-stat"><div className="profile-stat-val">{fmt(summary.totalSpent)}</div><div className="profile-stat-label">Spent</div></div>
              <div className="profile-stat"><div className="profile-stat-val">{fmt(summary.walletBalance)}</div><div className="profile-stat-label">Wallet</div></div>
            </div>
          )}
        </div>
      </div>
      <div className="stagger">
        {menuItems.map((m) => (
          <div key={m.to} className="profile-menu-item" onClick={() => navigate(m.to)}>
            <span className="profile-menu-icon">{m.icon}</span>
            <div><div className="profile-menu-label">{m.label}</div><div className="profile-menu-sub">{m.sub}</div></div>
            <span className="profile-menu-arrow">›</span>
          </div>
        ))}
        <div className="profile-menu-item" onClick={async () => { await logout(); navigate('/login'); }} style={{ borderColor: 'rgba(239,68,68,0.2)', color: 'var(--danger)' }}>
          <span className="profile-menu-icon">🚪</span>
          <div><div className="profile-menu-label">Logout</div></div>
        </div>
      </div>
    </div>
  );
};

// ---- Edit Profile ----
export const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const f = useFormik({
    initialValues: { name: user?.name || '', phone: user?.phone || '', address: user?.address || '' },
    validationSchema: Yup.object({ name: Yup.string().required('Name required') }),
    onSubmit: async (vals, { setSubmitting }) => {
      try {
        const res = await authService.updateProfile(vals);
        updateUser(res.data.data);
        toast.success('Profile updated! ✅');
        navigate('/profile');
      } catch (e) { toast.error('Error', getErr(e)); }
      finally { setSubmitting(false); }
    },
  });

  return (
    <div className="anim-up" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="back-btn" onClick={() => navigate('/profile')}>← Back to Profile</div>
      <div className="page-title mb-24">Edit Profile</div>
      <div className="card">
        <form onSubmit={f.handleSubmit}>
          <Input label="Full Name" name="name" value={f.values.name} onChange={f.handleChange} error={f.touched.name && f.errors.name} />
          <Input label="Phone" name="phone" value={f.values.phone} onChange={f.handleChange} />
          <div className="form-group"><label className="form-label">Address</label><textarea name="address" className="form-control" rows={3} value={f.values.address} onChange={f.handleChange} /></div>
          <Btn variant="primary" type="submit" full loading={f.isSubmitting}>Save Changes</Btn>
        </form>
      </div>
    </div>
  );
};

// ---- Change Password ----
export const ChangePassword = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const f = useFormik({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Required'),
      newPassword: Yup.string().min(6).required('Required'),
      confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match').required('Required'),
    }),
    onSubmit: async (vals, { setSubmitting, resetForm }) => {
      try {
        await authService.changePassword({ currentPassword: vals.currentPassword, newPassword: vals.newPassword });
        toast.success('Password changed! 🔒');
        resetForm(); navigate('/profile');
      } catch (e) { toast.error('Error', getErr(e)); }
      finally { setSubmitting(false); }
    },
  });

  return (
    <div className="anim-up" style={{ maxWidth: 440, margin: '0 auto' }}>
      <div className="back-btn" onClick={() => navigate('/profile')}>← Back to Profile</div>
      <div className="page-title mb-24">Change Password</div>
      <div className="card">
        <form onSubmit={f.handleSubmit}>
          <PasswordInput label="Current Password" name="currentPassword" value={f.values.currentPassword} onChange={f.handleChange} error={f.touched.currentPassword && f.errors.currentPassword} />
          <PasswordInput label="New Password" name="newPassword" value={f.values.newPassword} onChange={f.handleChange} error={f.touched.newPassword && f.errors.newPassword} />
          <PasswordInput label="Confirm New Password" name="confirmPassword" value={f.values.confirmPassword} onChange={f.handleChange} error={f.touched.confirmPassword && f.errors.confirmPassword} />
          <Btn variant="primary" type="submit" full loading={f.isSubmitting}>Update Password</Btn>
        </form>
      </div>
    </div>
  );
};

// ---- Notifications ----
export const NotificationsPage = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll({ page, limit: 20 });
      setNotifs(res.data.data?.notifications || []);
      setTotalPages(res.data.data?.totalPages || 1);
    } catch (e) { toast.error('Error', getErr(e)); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const markRead = async (id) => {
    await notificationService.markRead(id).catch(() => {});
    setNotifs((p) => p.map((n) => n._id === id ? { ...n, read: true } : n));
  };

  const markAll = async () => {
    await notificationService.markAllRead().catch(() => {});
    setNotifs((p) => p.map((n) => ({ ...n, read: true })));
    toast.success('All marked as read');
  };

  const typeIcon = { order: '📦', wallet: '💰', offer: '🎁', general: '🔔', system: '⚙️' };

  return (
    <div className="anim-up" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-24">
        <div className="page-title">Notifications 🔔</div>
        {notifs.some(n => !n.read) && <button className="btn btn-ghost btn-sm" onClick={markAll}>Mark all read</button>}
      </div>
      {loading ? <Loader /> : notifs.length === 0 ? <EmptyState icon="🔔" title="No notifications" desc="You're all caught up!" /> : (
        <div>
          {notifs.map((n) => (
            <div key={n._id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => !n.read && markRead(n._id)}>
              <div className="notif-icon">{typeIcon[n.type] || '🔔'}</div>
              <div className="notif-body">
                <div className="notif-title">{n.title}</div>
                <div className="notif-msg">{n.message}</div>
                <div className="notif-time">{fmtRelative(n.createdAt)}</div>
              </div>
              {!n.read && <div className="notif-dot" />}
            </div>
          ))}
          <Pagination current={page} total={totalPages} onPage={setPage} />
        </div>
      )}
    </div>
  );
};

// ---- Shops Page ----
export const ShopsPage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { shopService } = require('../../services/index');

  useEffect(() => {
    shopService.getAll({ limit: 50 }).then((r) => setShops(r.data.data?.shops || [])).catch((e) => toast.error('Error', getErr(e))).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  return (
    <div className="anim-up">
      <div className="page-title mb-24">Our Shops 🏪</div>
      {shops.length === 0 ? <EmptyState icon="🏪" title="No shops available" /> : (
        <div className="items-grid stagger">
          {shops.map((s) => (
            <div key={s._id} className="item-card" style={{ cursor: 'default' }}>
              <div className="item-img" style={{ background: 'linear-gradient(135deg, var(--card2), var(--card))', fontSize: 48 }}>🏪</div>
              <div className="item-body">
                <div className="item-name">{s.name}</div>
                <div className="item-cat" style={{ textTransform: 'capitalize' }}>{s.type?.replace('_', ' ')}</div>
                {s.phone && <div className="text-muted text-xs" style={{ marginTop: 4 }}>📞 {s.phone}</div>}
                {s.address && <div className="text-muted text-xs" style={{ marginTop: 2 }}>📍 {s.address}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

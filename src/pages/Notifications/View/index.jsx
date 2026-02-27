import { useState, useEffect } from 'react';
import { notificationService } from '../../../services/index';
import { useToast } from '../../../context/UIContext';
import { formatRelative } from '../../../utils/formatters';
import { getErrorMessage } from '../../../utils/helpers';
import { Loader, EmptyState } from '../../../components/common/index.jsx';

const NotificationsView = () => {
  const toast = useToast();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifs(); }, []);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      setNotifs(res.data.data?.notifications || res.data.data || []);
    } catch (err) {
      toast.error('Error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifs((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Error', getErrorMessage(err));
    }
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-24">
        <div>
          <h1 className="page-title">Notifications 🔔</h1>
          {unreadCount > 0 && <p className="page-subtitle">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline btn-sm" onClick={handleMarkAll}>
            Mark all read
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <Loader />
        ) : notifs.length === 0 ? (
          <EmptyState icon="🔔" title="No notifications" desc="You're all caught up!" />
        ) : (
          notifs.map((n) => (
            <div
              key={n._id}
              className={`notif-item ${!n.read ? 'unread' : ''}`}
              onClick={() => !n.read && handleMarkRead(n._id)}
            >
              <div className="notif-icon">
                {n.type === 'order' ? '📦' : n.type === 'wallet' ? '💰' : n.type === 'offer' ? '🎁' : '🔔'}
              </div>
              <div>
                <div className="notif-title">{n.title}</div>
                <div className="notif-body">{n.message}</div>
                <div className="notif-time">{formatRelative(n.createdAt)}</div>
              </div>
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsView;

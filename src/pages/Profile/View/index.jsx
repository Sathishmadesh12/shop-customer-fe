import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { formatDate, getInitials } from '../../../utils/formatters';

const ProfileView = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: '✏️', label: 'Edit Profile', action: () => navigate('/profile/edit') },
    { icon: '📦', label: 'My Orders', action: () => navigate('/orders') },
    { icon: '💰', label: 'My Wallet', action: () => navigate('/wallet') },
    { icon: '🔔', label: 'Notifications', action: () => navigate('/notifications') },
    { icon: '🔒', label: 'Change Password', action: () => navigate('/profile/change-password') },
  ];

  return (
    <div className="page-container">
      {/* Profile Hero */}
      <div className="profile-hero animate-slideup">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">{getInitials(user?.name)}</div>
          <div className="profile-avatar-edit" onClick={() => navigate('/profile/edit')}>✏️</div>
        </div>
        <div>
          <div className="profile-name">{user?.name}</div>
          <div className="profile-email">{user?.email}</div>
          <div className="profile-stats">
            <div>
              <div className="profile-stat-num">{user?.phone || '—'}</div>
              <div className="profile-stat-label">Phone</div>
            </div>
            <div>
              <div className="profile-stat-num">{formatDate(user?.createdAt) || '—'}</div>
              <div className="profile-stat-label">Joined</div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="card animate-slideup">
        {menuItems.map((item, i) => (
          <div key={i}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 4px', cursor: 'pointer', transition: 'var(--transition)' }}
              onClick={item.action}
              className="sidebar-link"
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 15, fontWeight: 500 }}>{item.label}</span>
              <span style={{ marginLeft: 'auto', color: 'var(--text-faint)' }}>›</span>
            </div>
            {i < menuItems.length - 1 && <div className="separator" style={{ margin: '2px 0' }} />}
          </div>
        ))}
      </div>

      <button className="btn btn-danger btn-full mt-auto" style={{ marginTop: 20 }} onClick={handleLogout}>
        🚪 Logout
      </button>
    </div>
  );
};

export default ProfileView;

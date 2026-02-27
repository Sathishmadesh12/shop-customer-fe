import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { getInitials } from '../../../utils/formatters';
import { useToast } from '../../../context/UIContext';

const navItems = [
  { to: '/', icon: '🏠', label: 'Home', exact: true },
  { to: '/shops', icon: '🛍️', label: 'Shops' },
  { to: '/cart', icon: '🛒', label: 'Cart', badge: true },
  { to: '/orders', icon: '📦', label: 'My Orders' },
  { to: '/wallet', icon: '💰', label: 'Wallet' },
  { to: '/notifications', icon: '🔔', label: 'Notifications' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out', 'See you soon!');
    navigate('/login');
  };

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🛒</div>
          <span className="sidebar-logo-text">ShopFlow</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && cartCount > 0 && (
                <span className="badge" style={{ position: 'static', marginLeft: 'auto' }}>
                  {cartCount}
                </span>
              )}
            </NavLink>
          ))}

          <div className="separator" />
          <button className="sidebar-link w-full" onClick={handleLogout} style={{ border: 'none', cursor: 'pointer' }}>
            <span className="sidebar-link-icon">🚪</span>
            <span>Logout</span>
          </button>
        </nav>

        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{getInitials(user.name)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-email">{user.email}</div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;

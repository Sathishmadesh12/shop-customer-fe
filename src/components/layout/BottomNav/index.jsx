import { NavLink } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';

const navItems = [
  { to: '/', icon: '🏠', label: 'Home', exact: true },
  { to: '/shops', icon: '🛍️', label: 'Shops' },
  { to: '/cart', icon: '🛒', label: 'Cart', badge: true },
  { to: '/orders', icon: '📦', label: 'Orders' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

const BottomNav = () => {
  const { cartCount } = useCart();

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <span className="nav-icon">{item.icon}</span>
              {item.badge && cartCount > 0 && (
                <span className="badge" style={{ top: '-6px', right: '-8px' }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;

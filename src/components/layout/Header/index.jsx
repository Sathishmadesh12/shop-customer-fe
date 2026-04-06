import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { getInitials } from '../../../utils/formatters';

const Header = ({ onMenuClick }) => {
  const { cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/shops?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="header">
      <button className="header-icon-btn" onClick={onMenuClick} style={{ display: 'none' }} id="menu-btn" aria-label="Menu">
        ☰
      </button>

      <form className="header-search" onSubmit={handleSearch}>
        <span className="header-search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search items, shops..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      <div className="header-actions">
        <button className="header-icon-btn" onClick={() => navigate('/cart')} aria-label="Cart">
          🛒
          {cartCount > 0 && <span className="badge">{cartCount > 9 ? '9+' : cartCount}</span>}
        </button>
        <button className="header-icon-btn" onClick={() => navigate('/notifications')} aria-label="Notifications">
          🔔
        </button>
        <div className="header-avatar" onClick={() => navigate('/profile')} role="button" tabIndex={0}>
          {getInitials(user?.name || 'U')}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { #menu-btn { display: flex !important; } }
      `}</style>
    </header>
  );
};

export default Header;

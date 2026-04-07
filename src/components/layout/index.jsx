import { NavLink, useNavigate, Navigate } from "react-router-dom";
import { useAuth, useCart, useToast } from "../../context/index";
import { initials } from "../../utils/index";

// ---- Sidebar ----
export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const navs = [
    { to: "/", icon: "🏠", label: "Home", exact: true },
    { to: "/shops", icon: "🏪", label: "Shops" },
    { to: "/cart", icon: "🛒", label: "Cart", badge: itemCount },
    { to: "/orders", icon: "📦", label: "Orders" },
    { to: "/wallet", icon: "💰", label: "Wallet" },
    { to: "/notifications", icon: "🔔", label: "Notifications" },
    { to: "/profile", icon: "👤", label: "Profile" },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out!");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🛒</div>
        <span className="sidebar-logo-text">ShopFlow</span>
      </div>

      <nav className="sidebar-nav">
        {navs.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.exact}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">{n.icon}</span>
            <span>{n.label}</span>
            {n.badge > 0 && <span className="cart-badge">{n.badge}</span>}
          </NavLink>
        ))}
        <div className="sep" />
        <button
          className="nav-item w-full"
          style={{ border: "none" }}
          onClick={handleLogout}
        >
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials(user.name)}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.name}
              </div>
              <div
                className="text-muted text-xs"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.email}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

// ---- Header ----
export const Header = ({ search, onSearch }) => {
  const { itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-search" style={{ position: "relative" }}>
        <span
          className="header-search-icon"
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        >
          🔍
        </span>
        <input
          className="header-search-input"
          placeholder="Search items..."
          value={search || ""}
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      <div className="header-right">
        <button
          className="header-icon-btn"
          onClick={() => navigate("/notifications")}
        >
          🔔
        </button>
        <button className="header-icon-btn" onClick={() => navigate("/cart")}>
          🛒
          {itemCount > 0 && (
            <span className="header-notif-dot">{itemCount}</span>
          )}
        </button>
      </div>
    </header>
  );
};

// ---- BottomNav ----
export const BottomNav = () => {
  const { itemCount } = useCart();
  const navs = [
    { to: "/", icon: "🏠", label: "Home", exact: true },
    { to: "/shops", icon: "🏪", label: "Shops" },
    { to: "/cart", icon: "🛒", label: "Cart", badge: itemCount },
    { to: "/orders", icon: "📦", label: "Orders" },
    { to: "/profile", icon: "👤", label: "Profile" },
  ];
  return (
    <nav className="bottom-nav">
      {navs.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.exact}
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? "active" : ""}`
          }
        >
          <div className="bottom-nav-icon" style={{ position: "relative" }}>
            {n.icon}
            {n.badge > 0 && (
              <span className="bottom-cart-badge">{n.badge}</span>
            )}
          </div>
          <span>{n.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

// ---- AppLayout ----
export const AppLayout = ({ children, search, onSearch }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading)
    return (
      <div className="page-loader">
        <div className="loader-ring" />
      </div>
    );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header search={search} onSearch={onSearch} />
        <div className="page-wrap">{children}</div>
      </div>
      <BottomNav />
    </div>
  );
};

// ---- PublicRoute ----
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading)
    return (
      <div className="page-loader">
        <div className="loader-ring" />
      </div>
    );
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

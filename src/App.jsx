import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, CartProvider, ToastProvider } from './context/index';
import { AppLayout, PublicRoute } from './components/layout/index.jsx';
import { Login, Register, ForgotPassword } from './pages/Auth/index.jsx';
import Home from './pages/Home/index.jsx';
import { CartPage, CheckoutPage } from './pages/Cart/index.jsx';
import {
  OrdersPage, OrderDetail, WalletPage,
  ProfilePage, EditProfile, ChangePassword,
  NotificationsPage,
} from './pages/index.jsx';
import { shopService } from './services/index';
import { useEffect } from 'react';
import { Loader, EmptyState } from './components/common/index.jsx';
import { useToast } from './context/index';
import { getErr, fmt, imgUrl } from './utils/index';

// Shops page inline (simple)
const ShopsPage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    shopService.getAll({ limit: 50 }).then((r) => setShops(r.data.data?.shops || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) return <Loader />;
  return (
    <div className="anim-up">
      <div className="page-title mb-24">Our Shops 🏪</div>
      {shops.length === 0 ? <EmptyState icon="🏪" title="No shops yet" /> : (
        <div className="items-grid stagger">
          {shops.map((s) => (
            <div key={s._id} className="item-card">
              <div className="item-img" style={{ fontSize: 48 }}>🏪</div>
              <div className="item-body">
                <div className="item-name">{s.name}</div>
                <div className="item-cat" style={{ textTransform: 'capitalize' }}>{s.type?.replace('_', ' ')}</div>
                {s.phone && <div className="text-muted text-xs" style={{ marginTop: 6 }}>📞 {s.phone}</div>}
                {s.address && <div className="text-muted text-xs" style={{ marginTop: 3 }}>📍 {s.address}</div>}
                {s.taxRate > 0 && <div className="text-xs text-muted" style={{ marginTop: 4 }}>{s.taxName}: {s.taxRate}%</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Wrapper to pass search into Home
const AppWrapper = () => {
  const [search, setSearch] = useState('');
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      <Route path="/" element={<AppLayout search={search} onSearch={setSearch}><Home search={search} /></AppLayout>} />
      <Route path="/shops" element={<AppLayout><ShopsPage /></AppLayout>} />
      <Route path="/cart" element={<AppLayout><CartPage /></AppLayout>} />
      <Route path="/cart/checkout" element={<AppLayout><CheckoutPage /></AppLayout>} />
      <Route path="/orders" element={<AppLayout><OrdersPage /></AppLayout>} />
      <Route path="/orders/:id" element={<AppLayout><OrderDetail /></AppLayout>} />
      <Route path="/wallet" element={<AppLayout><WalletPage /></AppLayout>} />
      <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
      <Route path="/profile/edit" element={<AppLayout><EditProfile /></AppLayout>} />
      <Route path="/profile/change-password" element={<AppLayout><ChangePassword /></AppLayout>} />
      <Route path="/notifications" element={<AppLayout><NotificationsPage /></AppLayout>} />
      <Route path="*" element={<AppLayout search={search} onSearch={setSearch}><Home search={search} /></AppLayout>} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <AppWrapper />
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, cartService } from '../services/index';

// ---- Toast Context ----
const ToastContext = createContext(null);
let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((type, title, msg, dur = 3500) => {
    const id = ++toastId;
    setToasts((p) => [...p, { id, type, title, msg }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), dur);
  }, []);
  const remove = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);
  const toast = { success: (t, m) => add('success', t, m), error: (t, m) => add('error', t, m), info: (t, m) => add('info', t, m), warning: (t, m) => add('warning', t, m) };
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">{icons[t.type]}</span>
            <div className="toast-body">
              <div className="toast-title">{t.title}</div>
              {t.msg && <div className="toast-msg">{t.msg}</div>}
            </div>
            <button className="toast-close" onClick={() => remove(t.id)}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
export const useToast = () => useContext(ToastContext);

// ---- Auth Context ----
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('sf_token');
      if (token) {
        try { const res = await authService.getMe(); setUser(res.data.data); } catch { localStorage.removeItem('sf_token'); }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    const { token, user: u } = res.data.data;
    localStorage.setItem('sf_token', token);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch {}
    localStorage.removeItem('sf_token');
    setUser(null);
  }, []);

  const updateUser = useCallback((d) => setUser((p) => ({ ...p, ...d })), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);

// ---- Cart Context ----
const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try { const res = await cartService.get(); setCart(res.data.data); } catch {}
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = useCallback(async (itemId, quantity = 1) => {
    setLoading(true);
    try { const res = await cartService.addItem({ itemId, quantity }); setCart(res.data.data); return res; }
    finally { setLoading(false); }
  }, []);

  const updateItem = useCallback(async (cartItemId, quantity) => {
    const res = await cartService.updateItem(cartItemId, { quantity });
    setCart(res.data.data); return res;
  }, []);

  const removeItem = useCallback(async (cartItemId) => {
    const res = await cartService.removeItem(cartItemId);
    setCart(res.data.data);
  }, []);

  const applyCoupon = useCallback(async (code) => {
    const res = await cartService.applyCoupon({ code });
    setCart(res.data.data); return res;
  }, []);

  const removeCoupon = useCallback(async () => {
    const res = await cartService.removeCoupon();
    setCart(res.data.data);
  }, []);

  const toggleWallet = useCallback(async (use) => {
    const res = await cartService.toggleWallet({ use });
    setCart(res.data.data);
  }, []);

  const clearCart = useCallback(async () => {
    await cartService.clear();
    setCart(null);
    fetchCart();
  }, [fetchCart]);

  const itemCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, fetchCart, addItem, updateItem, removeItem, applyCoupon, removeCoupon, toggleWallet, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
export const useCart = () => useContext(CartContext);

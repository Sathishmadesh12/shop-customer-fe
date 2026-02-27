import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/index';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await cartService.getCart();
      setCart(res.data.data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (itemId, quantity = 1) => {
    const res = await cartService.addItem({ itemId, quantity });
    setCart(res.data.data);
    return res.data;
  };

  const updateItem = async (cartItemId, qty) => {
    const res = await cartService.updateItem(cartItemId, qty);
    setCart(res.data.data);
    return res.data;
  };

  const removeItem = async (cartItemId) => {
    const res = await cartService.removeItem(cartItemId);
    setCart(res.data.data);
    return res.data;
  };

  const applyCoupon = async (code) => {
    const res = await cartService.applyCoupon(code);
    setCart(res.data.data);
    return res.data;
  };

  const removeCoupon = async () => {
    const res = await cartService.removeCoupon();
    setCart(res.data.data);
    return res.data;
  };

  const toggleWallet = async (use) => {
    const res = await cartService.applyWallet(use);
    setCart(res.data.data);
    return res.data;
  };

  const clearCart = async () => {
    await cartService.clearCart();
    setCart(null);
  };

  const cartCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addItem, updateItem, removeItem, applyCoupon, removeCoupon, toggleWallet, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};

export default CartContext;

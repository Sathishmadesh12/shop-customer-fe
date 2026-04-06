import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useToast } from '../../../context/UIContext';
import { formatCurrency, getInitials } from '../../../utils/formatters';
import { getErrorMessage, getImageUrl } from '../../../utils/helpers';
import { Loader, EmptyState } from '../../../components/common/index.jsx';

const CartView = () => {
  const { cart, loading, updateItem, removeItem, applyCoupon, removeCoupon, toggleWallet } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const handleQtyChange = async (cartItemId, qty) => {
    if (qty < 1) return;
    try { await updateItem(cartItemId, qty); }
    catch (err) { toast.error('Error', getErrorMessage(err)); }
  };

  const handleRemove = async (cartItemId) => {
    setRemovingId(cartItemId);
    try {
      await removeItem(cartItemId);
      toast.success('Removed from cart');
    } catch (err) {
      toast.error('Error', getErrorMessage(err));
    } finally {
      setRemovingId(null);
    }
  };

  const handleCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      await applyCoupon(couponInput.trim().toUpperCase());
      toast.success('Coupon applied! 🎉');
      setCouponInput('');
    } catch (err) {
      toast.error('Invalid coupon', getErrorMessage(err));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try { await removeCoupon(); toast.info('Coupon removed'); }
    catch (err) { toast.error('Error', getErrorMessage(err)); }
  };

  const handleWallet = async (use) => {
    try { await toggleWallet(use); }
    catch (err) { toast.error('Error', getErrorMessage(err)); }
  };

  if (loading) return <div className="page-container"><Loader /></div>;

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="page-container">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          desc="Looks like you haven't added anything yet"
          action={
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Start Shopping
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Your Cart</h1>
        <p className="page-subtitle">{cart.items?.length} item(s) in your cart</p>
      </div>

      <div className="grid-checkout">
        {/* Items */}
        <div className="stagger-children">
          {cart.items?.map((ci) => (
            <div key={ci._id} className="cart-item">
              <div className="cart-item-img">
                {ci.item?.image
                  ? <img src={getImageUrl(ci.item.image)} alt={ci.item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 32 }}>🛍️</span>
                }
              </div>
              <div className="cart-item-info">
                <div className="cart-item-name">{ci.item?.name}</div>
                <div className="cart-item-cat">{ci.item?.category?.name}</div>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => handleQtyChange(ci._id, ci.quantity - 1)}>−</button>
                  <div className="qty-value">{ci.quantity}</div>
                  <button className="qty-btn" onClick={() => handleQtyChange(ci._id, ci.quantity + 1)}>+</button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <div className="cart-item-price">{formatCurrency((ci.item?.offerPrice || ci.item?.price) * ci.quantity)}</div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleRemove(ci._id)}
                  disabled={removingId === ci._id}
                >
                  🗑 Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bill Summary */}
        <div className="animate-slideup">
          <div className="bill-summary">
            <div className="bill-summary-title">Order Summary</div>

            {/* Coupon */}
            {!cart.coupon ? (
              <div className="coupon-input-wrap">
                <input
                  type="text"
                  className="form-control"
                  placeholder="COUPON CODE"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleCoupon()}
                  style={{ letterSpacing: 1 }}
                />
                <button
                  className={`btn btn-outline btn-sm ${couponLoading ? 'btn-loading' : ''}`}
                  onClick={handleCoupon}
                  disabled={couponLoading}
                >
                  <span className="btn-text">Apply</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>🎟 {cart.coupon.code}</span>
                <button className="btn btn-ghost btn-sm" onClick={handleRemoveCoupon} style={{ padding: '4px 8px' }}>✕</button>
              </div>
            )}

            {/* Wallet */}
            {cart.walletBalance > 0 && (
              <div
                className={`wallet-toggle ${cart.useWallet ? 'active' : ''}`}
                onClick={() => handleWallet(!cart.useWallet)}
              >
                <div className="wallet-toggle-left">
                  <div className="wallet-icon-wrap">💰</div>
                  <div>
                    <div className="wallet-label">Use Wallet</div>
                    <div className="wallet-balance">Balance: {formatCurrency(cart.walletBalance)}</div>
                  </div>
                </div>
                <div className={`toggle ${cart.useWallet ? 'on' : ''}`} />
              </div>
            )}

            {/* Bill rows */}
            <div className="bill-row">
              <span>Subtotal</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>
            {cart.discount > 0 && (
              <div className="bill-row discount">
                <span>Discount</span>
                <span>− {formatCurrency(cart.discount)}</span>
              </div>
            )}
            {cart.walletDeduction > 0 && (
              <div className="bill-row discount">
                <span>Wallet Used</span>
                <span>− {formatCurrency(cart.walletDeduction)}</span>
              </div>
            )}
            {cart.tax > 0 && (
              <div className="bill-row">
                <span>Tax</span>
                <span>{formatCurrency(cart.tax)}</span>
              </div>
            )}
            <div className="bill-row total">
              <span>Total Payable</span>
              <span className="bill-total-amount">{formatCurrency(cart.total)}</span>
            </div>

            <button
              className="btn btn-accent btn-full btn-lg"
              style={{ marginTop: 20 }}
              onClick={() => navigate('/cart/checkout')}
            >
              Proceed to Checkout →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView;

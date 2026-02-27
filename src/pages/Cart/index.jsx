import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useToast } from '../../context/index';
import { fmt, imgUrl, getErr } from '../../utils/index';
import { Loader, EmptyState, Toggle, Btn } from '../../components/common/index.jsx';
import { orderService } from '../../services/index';

// ---- Cart Page ----
export const CartPage = () => {
  const { cart, loading, updateItem, removeItem, applyCoupon, removeCoupon, toggleWallet } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      await applyCoupon(couponCode.trim());
      toast.success('Coupon applied! 🎉');
      setCouponCode('');
    } catch (e) { toast.error('Invalid coupon', getErr(e)); }
    finally { setApplyingCoupon(false); }
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
    toast.info('Coupon removed');
  };

  if (loading && !cart) return <Loader />;

  const items = cart?.items || [];

  return (
    <div className="anim-up">
      <div className="page-header">
        <div>
          <div className="page-title">Your Cart 🛒</div>
          <div className="page-subtitle">{items.length} item(s) in your cart</div>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="🛒" title="Cart is empty" desc="Add some items to your cart and they'll appear here" action={<button className="btn btn-primary" onClick={() => navigate('/')}>Browse Items</button>} />
      ) : (
        <div className="cart-layout">
          {/* Items */}
          <div>
            {items.map((ci) => (
              <div key={ci._id} className="cart-item">
                <div className="cart-item-img">
                  {ci.item?.image ? <img src={imgUrl(ci.item.image)} alt={ci.item?.name} /> : '🛍️'}
                </div>
                <div className="cart-item-body">
                  <div className="cart-item-name">{ci.item?.name}</div>
                  <div className="cart-item-price">{fmt(ci.offerPrice || ci.price)}</div>
                </div>
                {/* Qty controls */}
                <div className="item-qty-ctrl">
                  <button className="qty-btn" onClick={() => updateItem(ci._id, ci.quantity - 1)}>−</button>
                  <span className="qty-val">{ci.quantity}</span>
                  <button className="qty-btn" onClick={() => updateItem(ci._id, ci.quantity + 1)}>+</button>
                </div>
                <button className="cart-item-remove" onClick={() => removeItem(ci._id)}>🗑️</button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <div className="cart-summary-title">Order Summary</div>

            {/* Coupon */}
            {cart?.couponCode ? (
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 700 }}>🎟️ {cart.couponCode}</div>
                  <div className="text-muted text-xs">Coupon applied</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={handleRemoveCoupon}>×</button>
              </div>
            ) : (
              <div className="coupon-input-wrap">
                <input className="coupon-input" placeholder="COUPON CODE" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && handleCoupon()} />
                <button className={`btn btn-outline btn-sm ${applyingCoupon ? 'btn-loading' : ''}`} onClick={handleCoupon} disabled={applyingCoupon}>
                  <span className="btn-text">Apply</span>
                </button>
              </div>
            )}

            {/* Wallet toggle */}
            {cart?.walletBalance > 0 && (
              <div className="wallet-toggle">
                <div className="wallet-toggle-info">
                  <div className="wallet-toggle-label">💰 Use Wallet</div>
                  <div className="wallet-toggle-bal text-xs">Balance: {fmt(cart.walletBalance)}</div>
                </div>
                <Toggle value={cart.useWallet} onChange={(v) => toggleWallet(v)} />
              </div>
            )}

            {/* Bill rows */}
            <div className="summary-row"><span>Subtotal</span><span>{fmt(cart.subtotal)}</span></div>
            {cart?.discount > 0 && <div className="summary-row discount"><span>Discount 🎟️</span><span>-{fmt(cart.discount)}</span></div>}
            {cart?.walletDeduction > 0 && <div className="summary-row wallet"><span>Wallet 💰</span><span>-{fmt(cart.walletDeduction)}</span></div>}
            {cart?.tax > 0 && <div className="summary-row"><span>Tax</span><span>{fmt(cart.tax)}</span></div>}
            <div className="summary-row total"><span>Total</span><span className="summary-total-amt">{fmt(cart.total)}</span></div>

            <button className="btn btn-accent btn-full btn-lg" style={{ marginTop: 16 }} onClick={() => navigate('/cart/checkout')}>
              Proceed to Checkout →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Checkout Page ----
export const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [placing, setPlacing] = useState(false);

  if (!cart?.items?.length) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const res = await orderService.create({ paymentMethod, notes, transactionRef });
      await clearCart();
      toast.success('Order placed! 🎉');
      navigate(`/orders/${res.data.data._id}`);
    } catch (e) { toast.error('Order failed', getErr(e)); }
    finally { setPlacing(false); }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
    { value: 'qr', label: 'QR Code', icon: '📱', desc: 'Scan and pay now' },
    { value: 'upi', label: 'UPI', icon: '⚡', desc: 'Instant UPI payment' },
  ];

  return (
    <div className="anim-up" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="back-btn" onClick={() => navigate('/cart')}>← Back to Cart</div>

      <div className="page-header">
        <div>
          <div className="page-title">Checkout 💳</div>
          <div className="page-subtitle">Final step to complete your order</div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="card mb-16">
        <div className="card-title">Payment Method</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {paymentMethods.map((pm) => (
            <div key={pm.value}
              onClick={() => setPaymentMethod(pm.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                borderRadius: 10, cursor: 'pointer', transition: 'var(--transition)',
                background: paymentMethod === pm.value ? 'rgba(79,70,229,0.1)' : 'var(--card2)',
                border: `1px solid ${paymentMethod === pm.value ? 'var(--border-active)' : 'var(--border)'}`,
              }}>
              <span style={{ fontSize: 28 }}>{pm.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{pm.label}</div>
                <div className="text-muted text-xs">{pm.desc}</div>
              </div>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${paymentMethod === pm.value ? 'var(--primary)' : 'var(--border)'}`, background: paymentMethod === pm.value ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {paymentMethod === pm.value && <div style={{ width: 7, height: 7, background: 'white', borderRadius: '50%' }} />}
              </div>
            </div>
          ))}
        </div>

        {(paymentMethod === 'qr' || paymentMethod === 'upi') && (
          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Transaction Reference *</label>
            <input className="form-control" placeholder="Enter transaction ID" value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} />
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="card mb-16">
        <div className="card-title">Order Notes (optional)</div>
        <textarea className="form-control" rows={3} placeholder="Special instructions..." value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {/* Final Summary */}
      <div className="card">
        <div className="card-title">Order Total</div>
        <div className="summary-row"><span>Items ({cart.items.length})</span><span>{fmt(cart.subtotal)}</span></div>
        {cart.discount > 0 && <div className="summary-row discount"><span>Discount</span><span>-{fmt(cart.discount)}</span></div>}
        {cart.walletDeduction > 0 && <div className="summary-row" style={{ color: 'var(--primary-light)' }}><span>Wallet</span><span>-{fmt(cart.walletDeduction)}</span></div>}
        <div className="summary-row total"><span>You Pay</span><span className="summary-total-amt">{fmt(cart.total)}</span></div>

        <Btn variant="accent" full size="lg" loading={placing} onClick={handlePlaceOrder} className="mt-auto" style={{ marginTop: 20 }}>
          Place Order 🎉
        </Btn>
      </div>
    </div>
  );
};

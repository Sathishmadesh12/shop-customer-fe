import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { useCart } from '../../../context/CartContext';
import { useToast } from '../../../context/UIContext';
import { orderService } from '../../../services/index';
import { formatCurrency } from '../../../utils/formatters';
import { getErrorMessage } from '../../../utils/helpers';
import { Loader } from '../../../components/common/index.jsx';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { paymentMethod: 'cash', notes: '', transactionRef: '' },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const res = await orderService.create({ ...values, cartId: cart?._id });
        await clearCart();
        toast.success('Order placed! 🎉', 'Your order has been confirmed');
        navigate(`/orders/${res.data.data._id}`);
      } catch (err) {
        toast.error('Order failed', getErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (!cart || cart.items?.length === 0) {
    navigate('/cart'); return null;
  }

  const payMethods = [
    { id: 'cash', icon: '💵', label: 'Cash on Delivery' },
    { id: 'qr', icon: '📱', label: 'QR / Scan & Pay' },
    { id: 'upi', icon: '🏦', label: 'UPI Transfer' },
  ];

  return (
    <div className="page-container">
      <button className="btn btn-ghost btn-sm mb-24" onClick={() => navigate('/cart')}>
        ← Back to Cart
      </button>

      <div className="page-header">
        <h1 className="page-title">Checkout</h1>
        <p className="page-subtitle">Review and confirm your order</p>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <div className="grid-checkout">
          <div>
            {/* Payment Method */}
            <div className="card mb-24">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>
                💳 Payment Method
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {payMethods.map((pm) => (
                  <label
                    key={pm.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                      background: formik.values.paymentMethod === pm.id ? 'rgba(79,70,229,0.1)' : 'var(--bg-card2)',
                      border: `1px solid ${formik.values.paymentMethod === pm.id ? 'var(--border-active)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'var(--transition)'
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm.id}
                      checked={formik.values.paymentMethod === pm.id}
                      onChange={formik.handleChange}
                      style={{ accentColor: 'var(--primary)', width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 22 }}>{pm.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{pm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Transaction Ref */}
            {formik.values.paymentMethod !== 'cash' && (
              <div className="card mb-24">
                <div className="form-group mb-0">
                  <label className="form-label">Transaction Reference (optional)</label>
                  <div className="input-wrapper">
                    <span className="input-icon">#</span>
                    <input
                      type="text"
                      name="transactionRef"
                      className="form-control"
                      placeholder="Enter UTR / Transaction ID"
                      value={formik.values.transactionRef}
                      onChange={formik.handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="card mb-24">
              <div className="form-group mb-0">
                <label className="form-label">Order Notes (optional)</label>
                <textarea
                  name="notes"
                  className="form-control"
                  rows={3}
                  placeholder="Any special instructions..."
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bill-summary">
              <div className="bill-summary-title">Order Summary</div>
              {cart.items?.map((ci) => (
                <div key={ci._id} className="bill-row" style={{ fontSize: 13 }}>
                  <span>{ci.item?.name} × {ci.quantity}</span>
                  <span>{formatCurrency((ci.item?.offerPrice || ci.item?.price) * ci.quantity)}</span>
                </div>
              ))}
              <div className="separator" />
              {cart.discount > 0 && (
                <div className="bill-row discount">
                  <span>Coupon Discount</span>
                  <span>− {formatCurrency(cart.discount)}</span>
                </div>
              )}
              {cart.walletDeduction > 0 && (
                <div className="bill-row discount">
                  <span>Wallet Deduction</span>
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
                <span>Total</span>
                <span className="bill-total-amount">{formatCurrency(cart.total)}</span>
              </div>

              <button
                type="submit"
                className={`btn btn-accent btn-full btn-lg ${formik.isSubmitting ? 'btn-loading' : ''}`}
                style={{ marginTop: 20 }}
                disabled={formik.isSubmitting}
              >
                <span className="btn-text">✅ Confirm Order</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;

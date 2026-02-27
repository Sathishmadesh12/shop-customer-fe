import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../../services/index';
import { useToast } from '../../../context/UIContext';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { getErrorMessage } from '../../../utils/helpers';
import { Loader } from '../../../components/common/index.jsx';

const statusLabel = { pending: 'Pending', processing: 'Processing', completed: 'Completed', cancelled: 'Cancelled' };

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await orderService.getById(id);
        setOrder(res.data.data);
      } catch (err) {
        toast.error('Error', getErrorMessage(err));
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="page-container"><Loader /></div>;
  if (!order) return null;

  return (
    <div className="page-container">
      <button className="btn btn-ghost btn-sm mb-24" onClick={() => navigate('/orders')}>← Back</button>

      <div className="flex justify-between items-center mb-24">
        <div>
          <h1 className="page-title">Order Details</h1>
          <p className="text-muted text-sm">#{order._id?.slice(-8)?.toUpperCase()}</p>
        </div>
        <span className={`order-status status-${order.status}`}>{statusLabel[order.status]}</span>
      </div>

      <div className="grid-2">
        {/* Items */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Items Ordered</h3>
          {order.items?.map((oi, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{oi.item?.name || oi.name}</div>
                <div className="text-muted text-xs">Qty: {oi.quantity} × {formatCurrency(oi.price)}</div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{formatCurrency(oi.quantity * oi.price)}</div>
            </div>
          ))}
        </div>

        {/* Payment summary */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Payment Summary</h3>
          <div className="bill-row"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="bill-row discount"><span>Discount</span><span>− {formatCurrency(order.discount)}</span></div>}
          {order.walletDeduction > 0 && <div className="bill-row discount"><span>Wallet Used</span><span>− {formatCurrency(order.walletDeduction)}</span></div>}
          {order.tax > 0 && <div className="bill-row"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>}
          <div className="bill-row total"><span>Total Paid</span><span className="bill-total-amount">{formatCurrency(order.total)}</span></div>

          <div className="separator" />
          <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="flex justify-between">
              <span className="text-muted">Payment Method</span>
              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Order Date</span>
              <span style={{ fontWeight: 600 }}>{formatDateTime(order.createdAt)}</span>
            </div>
          </div>

          <button className="btn btn-outline btn-full mt-auto" style={{ marginTop: 20 }} onClick={() => navigate(`/orders/${id}/invoice`)}>
            🧾 View Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

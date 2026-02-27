import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../../services/index';
import { useToast } from '../../../context/UIContext';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { getErrorMessage } from '../../../utils/helpers';
import { Loader } from '../../../components/common/index.jsx';

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

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

  const handlePrint = () => window.print();

  if (loading) return <div className="page-container"><Loader /></div>;
  if (!order) return null;

  return (
    <div className="page-container">
      <div className="flex gap-12 mb-24">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/orders/${id}`)}>← Back</button>
        <button className="btn btn-primary btn-sm" onClick={handlePrint}>🖨️ Print</button>
      </div>

      <div className="invoice-wrap card animate-fadein" ref={printRef}>
        {/* Invoice Header */}
        <div className="invoice-header">
          <div>
            <div className="invoice-shop-name">{order.shop?.name || 'ShopFlow'}</div>
            <div className="text-muted text-sm">{order.shop?.address}</div>
            <div className="text-muted text-sm">{order.shop?.phone} · {order.shop?.email}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>INVOICE</div>
            <div className="text-muted text-sm">#{order._id?.slice(-8)?.toUpperCase()}</div>
            <div className="text-muted text-sm">{formatDateTime(order.createdAt)}</div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid-2 mb-24">
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 6 }}>Bill To</div>
            <div style={{ fontWeight: 600 }}>{order.customer?.name}</div>
            <div className="text-muted text-sm">{order.customer?.email}</div>
            <div className="text-muted text-sm">{order.customer?.phone}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 6 }}>Payment</div>
            <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{order.paymentMethod}</div>
            <div className="text-muted text-sm">{order.transactionRef || '—'}</div>
          </div>
        </div>

        {/* Items Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((oi, i) => (
              <tr key={i}>
                <td>{oi.item?.name || oi.name}</td>
                <td>{oi.quantity}</td>
                <td>{formatCurrency(oi.price)}</td>
                <td>{formatCurrency(oi.quantity * oi.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ maxWidth: 280, marginLeft: 'auto', marginTop: 20 }}>
          <div className="bill-row"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="bill-row discount"><span>Discount</span><span>− {formatCurrency(order.discount)}</span></div>}
          {order.walletDeduction > 0 && <div className="bill-row discount"><span>Wallet</span><span>− {formatCurrency(order.walletDeduction)}</span></div>}
          {order.tax > 0 && <div className="bill-row"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>}
          <div className="bill-row total"><span>Total</span><span className="bill-total-amount">{formatCurrency(order.total)}</span></div>
        </div>

        <div style={{ marginTop: 40, borderTop: '1px dashed var(--border)', paddingTop: 20, textAlign: 'center', color: 'var(--text-faint)', fontSize: 12 }}>
          Thank you for your purchase! Powered by ShopFlow 🛒
        </div>
      </div>
    </div>
  );
};

export default Invoice;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../../services/index';
import { useToast } from '../../../context/UIContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { getErrorMessage } from '../../../utils/helpers';
import { Loader, EmptyState, Pagination } from '../../../components/common/index.jsx';

const statusLabel = { pending: '⏳ Pending', processing: '🔄 Processing', completed: '✅ Completed', cancelled: '❌ Cancelled' };

const OrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => { fetchOrders(); }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getAll({ page, limit: 10 });
      setOrders(res.data.data?.orders || res.data.data || []);
      setTotalPages(res.data.data?.totalPages || 1);
    } catch (err) {
      toast.error('Error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-container"><Loader /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Orders 📦</h1>
        <p className="page-subtitle">Track all your purchases</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No orders yet"
          desc="Your order history will appear here"
          action={<button className="btn btn-primary" onClick={() => navigate('/')}>Shop Now</button>}
        />
      ) : (
        <div className="stagger-children">
          {orders.map((order) => (
            <div key={order._id} className="order-card" onClick={() => navigate(`/orders/${order._id}`)}>
              <div className="order-card-top">
                <div>
                  <div className="order-id">#{order._id?.slice(-8)?.toUpperCase()}</div>
                  <div className="order-date">{formatDate(order.createdAt)}</div>
                </div>
                <span className={`order-status status-${order.status}`}>{statusLabel[order.status] || order.status}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted text-sm">{order.items?.length} item(s)</span>
                <span className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          ))}
          <Pagination current={page} total={totalPages} onPage={setPage} />
        </div>
      )}
    </div>
  );
};

export default OrdersView;

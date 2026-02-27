import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopService } from '../../../services/index';
import { useToast } from '../../../context/UIContext';
import { getErrorMessage, getImageUrl } from '../../../utils/helpers';
import { Loader, EmptyState } from '../../../components/common/index.jsx';

const ShopView = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await shopService.getAll();
        setShops(res.data.data?.shops || res.data.data || []);
      } catch (err) {
        toast.error('Error', getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="page-container"><Loader /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">All Shops 🛍️</h1>
        <p className="page-subtitle">Browse and shop from our partners</p>
      </div>

      {shops.length === 0 ? (
        <EmptyState icon="🏪" title="No shops available" desc="Check back later!" />
      ) : (
        <div className="product-grid stagger-children">
          {shops.map((shop) => (
            <div
              key={shop._id}
              className="product-card"
              onClick={() => navigate(`/shops/${shop._id}`)}
            >
              <div className="product-card-img" style={{ aspectRatio: '16/9' }}>
                {shop.logo
                  ? <img src={getImageUrl(shop.logo)} alt={shop.name} />
                  : <span style={{ fontSize: 48 }}>🏪</span>
                }
              </div>
              <div className="product-card-body">
                <div className="product-card-name" style={{ fontSize: 16 }}>{shop.name}</div>
                <div className="product-card-category">{shop.type || 'Shop'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>📍 {shop.address || 'Location N/A'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopView;

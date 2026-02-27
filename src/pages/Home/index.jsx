import { useState, useEffect, useCallback } from 'react';
import { itemService, categoryService } from '../../services/index';
import { useCart, useToast } from '../../context/index';
import { getErr, fmt, imgUrl } from '../../utils/index';
import { Loader, Skeleton, EmptyState, Pagination } from '../../components/common/index.jsx';

const ItemCard = ({ item }) => {
  const { cart, addItem, updateItem, removeItem } = useCart();
  const toast = useToast();
  const [adding, setAdding] = useState(false);

  const cartItem = cart?.items?.find((i) => i.item?._id === item._id || i.item === item._id);
  const qty = cartItem?.quantity || 0;

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addItem(item._id, 1);
      toast.success('Added to cart! 🛒');
    } catch (e) { toast.error('Error', getErr(e)); }
    finally { setAdding(false); }
  };

  const handleQty = async (newQty) => {
    try {
      if (newQty < 1) await removeItem(cartItem._id);
      else await updateItem(cartItem._id, newQty);
    } catch (e) { toast.error('Error', getErr(e)); }
  };

  return (
    <div className="item-card">
      <div className="item-img">
        {item.image ? <img src={imgUrl(item.image)} alt={item.name} loading="lazy" /> : '🛍️'}
      </div>
      {item.offer > 0 && (
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span className="item-offer-badge">-{item.offer}%</span>
        </div>
      )}
      <div className="item-body">
        <div className="item-cat">{item.category?.name}</div>
        <div className="item-name">{item.name}</div>
        <div className="item-price-row">
          <span className="item-price">{fmt(item.offerPrice || item.price)}</span>
          {item.offer > 0 && <span className="item-og-price">{fmt(item.price)}</span>}
        </div>
        {qty > 0 ? (
          <div className="item-qty-ctrl">
            <button className="qty-btn" onClick={() => handleQty(qty - 1)}>−</button>
            <span className="qty-val">{qty}</span>
            <button className="qty-btn" onClick={() => handleQty(qty + 1)}>+</button>
          </div>
        ) : (
          <button className="item-add-btn" onClick={handleAdd} disabled={adding}>
            {adding ? '...' : '+ Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
};

const Home = ({ search }) => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  useEffect(() => {
    categoryService.getAll({ limit: 50 }).then((r) => setCategories(r.data.data?.categories || [])).catch(() => {});
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await itemService.getAll({ search, categoryId: catFilter || undefined, page, limit: 20 });
      setItems(res.data.data?.items || []);
      setTotalPages(res.data.data?.totalPages || 1);
    } catch (e) { toast.error('Error', getErr(e)); }
    finally { setLoading(false); }
  }, [search, catFilter, page]);

  useEffect(() => { setPage(1); }, [search, catFilter]);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  return (
    <div className="anim-up">
      <div className="page-header">
        <div>
          <div className="page-title">Discover Items 🛍️</div>
          <div className="page-subtitle">Fresh picks from our shops</div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="cat-pills">
        <button className={`cat-pill ${catFilter === '' ? 'active' : ''}`} onClick={() => setCatFilter('')}>All</button>
        {categories.map((c) => (
          <button key={c._id} className={`cat-pill ${catFilter === c._id ? 'active' : ''}`} onClick={() => setCatFilter(c._id)}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="items-grid">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="item-card">
              <div className="skeleton" style={{ height: 160 }} />
              <div style={{ padding: 12 }}>
                <Skeleton h={10} mb={8} w="60%" />
                <Skeleton h={14} mb={8} />
                <Skeleton h={20} mb={8} w="40%" />
                <Skeleton h={34} />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon="🔍" title="No items found" desc={search ? `No results for "${search}"` : 'No items available right now'} />
      ) : (
        <>
          <div className="items-grid stagger">{items.map((item) => <ItemCard key={item._id} item={item} />)}</div>
          <Pagination current={page} total={totalPages} onPage={setPage} />
        </>
      )}
    </div>
  );
};

export default Home;

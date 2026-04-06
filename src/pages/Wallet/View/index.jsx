import { useState, useEffect } from 'react';
import { walletService } from '../../../services/index';
import { useToast } from '../../../context/UIContext';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { getErrorMessage } from '../../../utils/helpers';
import { Loader, EmptyState, Pagination } from '../../../components/common/index.jsx';

const WalletView = () => {
  const toast = useToast();
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchWallet(); }, []);
  useEffect(() => { fetchHistory(); }, [page]);

  const fetchWallet = async () => {
    try {
      const res = await walletService.getWallet();
      setWallet(res.data.data);
    } catch (err) {
      toast.error('Error', getErrorMessage(err));
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await walletService.getHistory({ page, limit: 15 });
      setHistory(res.data.data?.transactions || res.data.data || []);
      setTotalPages(res.data.data?.totalPages || 1);
    } catch (err) {
      toast.error('Error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Wallet 💰</h1>
        <p className="page-subtitle">Your balance and transaction history</p>
      </div>

      {/* Wallet Hero */}
      <div className="wallet-hero animate-slideup">
        <div className="wallet-hero-label">Available Balance</div>
        <div className="wallet-hero-amount">{formatCurrency(wallet?.balance || 0)}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Wallet balance is automatically applied at checkout
        </div>
      </div>

      {/* History */}
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>
        Transaction History
      </h3>

      {loading ? (
        <Loader />
      ) : history.length === 0 ? (
        <EmptyState icon="📋" title="No transactions yet" desc="Your wallet transactions will appear here" />
      ) : (
        <div className="stagger-children">
          {history.map((txn) => {
            const isCredit = txn.type === 'credit';
            return (
              <div key={txn._id} className="wallet-txn-item">
                <div className={`wallet-txn-icon ${isCredit ? 'txn-credit' : 'txn-debit'}`}>
                  {isCredit ? '↓' : '↑'}
                </div>
                <div className="wallet-txn-info">
                  <div className="wallet-txn-desc">{txn.description || (isCredit ? 'Wallet Credited' : 'Wallet Debited')}</div>
                  <div className="wallet-txn-date">{formatDateTime(txn.createdAt)}</div>
                </div>
                <div className={`wallet-txn-amount ${isCredit ? 'txn-amount-credit' : 'txn-amount-debit'}`}>
                  {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                </div>
              </div>
            );
          })}
          <Pagination current={page} total={totalPages} onPage={setPage} />
        </div>
      )}
    </div>
  );
};

export default WalletView;

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { accountAPI } from '../services/api';

export default function Transactions() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    accountAPI.getAll().then(r => setAccounts(r.data)).catch(() => toast.error('Failed to load accounts'));
  }, []);

  useEffect(() => {
    if (!selectedAccount) { setTransactions([]); return; }
    setLoading(true);
    accountAPI.getTransactions(selectedAccount)
      .then(r => setTransactions(r.data))
      .catch(() => toast.error('Failed to load transactions'))
      .finally(() => setLoading(false));
  }, [selectedAccount]);

  const account = accounts.find(a => String(a.id) === String(selectedAccount));

  return (
    <div>
      <div className="page-header">
        <h1>Transactions</h1>
        <p>View transaction history for any account</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Select Account</label>
              <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
                <option value="">— Choose an account —</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.accountNumber} | {a.customer?.firstName} {a.customer?.lastName} | {a.accountType} | ₹{parseFloat(a.balance).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {account && (
            <div style={{ display: 'flex', gap: 24, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div><span className="stat-label">Account No</span><div className="font-mono" style={{ fontWeight: 600 }}>{account.accountNumber}</div></div>
              <div><span className="stat-label">Type</span><div>{account.accountType?.replace('_', ' ')}</div></div>
              <div><span className="stat-label">Balance</span><div style={{ fontWeight: 600, color: 'var(--success)' }}>₹{parseFloat(account.balance).toLocaleString('en-IN')}</div></div>
              <div><span className="stat-label">Status</span><div><span className={`badge ${account.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>{account.status}</span></div></div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2>Transaction History {transactions.length > 0 && `(${transactions.length})`}</h2></div>
        <div className="table-wrap">
          {!selectedAccount ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <h3>Select an account</h3><p>Choose an account above to view its transaction history.</p>
            </div>
          ) : loading ? (
            <div className="empty-state"><p>Loading transactions...</p></div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <h3>No transactions</h3><p>This account has no transactions yet.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr><th>#</th><th>Type</th><th>Amount</th><th>Balance After</th><th>Description</th><th>Date & Time</th></tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={tx.id}>
                    <td><span className="badge badge-navy">{transactions.length - i}</span></td>
                    <td>
                      <span className={`badge ${tx.transactionType === 'DEPOSIT' ? 'badge-success' : tx.transactionType === 'WITHDRAWAL' ? 'badge-danger' : 'badge-info'}`}>
                        {tx.transactionType}
                      </span>
                    </td>
                    <td>
                      <span className={tx.transactionType === 'DEPOSIT' ? 'text-success' : 'text-danger'} style={{ fontWeight: 600 }}>
                        {tx.transactionType === 'DEPOSIT' ? '+' : '-'}₹{parseFloat(tx.amount).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>₹{parseFloat(tx.balanceAfter).toLocaleString('en-IN')}</td>
                    <td>{tx.description || '—'}</td>
                    <td>{new Date(tx.createdAt).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

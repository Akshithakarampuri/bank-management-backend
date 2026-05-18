import React, { useEffect, useState } from 'react';
import { customerAPI, accountAPI } from '../services/api';

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([customerAPI.getAll(), accountAPI.getAll()])
      .then(([cRes, aRes]) => {
        setCustomers(cRes.data);
        setAccounts(aRes.data);
        // Fetch recent transactions from first 5 accounts
        const accs = aRes.data.slice(0, 5);
        return Promise.all(accs.map(a => accountAPI.getTransactions(a.id)));
      })
      .then(results => {
        const all = results.flatMap(r => r.data);
        all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTransactions(all.slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);
  const activeAccounts = accounts.filter(a => a.status === 'ACTIVE').length;

  if (loading) return <div className="empty-state"><p>Loading dashboard...</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to NexaBank Management System</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0e8f5' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <div>
            <div className="stat-value">{customers.length}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fdf3dc' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <div>
            <div className="stat-value">{accounts.length}</div>
            <div className="stat-label">Total Accounts</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <div className="stat-value">₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            <div className="stat-label">Total Deposits</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <div>
            <div className="stat-value">{activeAccounts}</div>
            <div className="stat-label">Active Accounts</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2>Recent Transactions</h2></div>
        <div className="table-wrap">
          {transactions.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <h3>No transactions yet</h3>
              <p>Transactions will appear here once accounts are active.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td className="font-mono">{tx.account?.accountNumber}</td>
                    <td>
                      <span className={`badge ${tx.transactionType === 'DEPOSIT' ? 'badge-success' : tx.transactionType === 'WITHDRAWAL' ? 'badge-danger' : 'badge-info'}`}>
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className={tx.transactionType === 'DEPOSIT' ? 'text-success' : 'text-danger'}>
                      {tx.transactionType === 'DEPOSIT' ? '+' : '-'}₹{parseFloat(tx.amount).toLocaleString('en-IN')}
                    </td>
                    <td>₹{parseFloat(tx.balanceAfter).toLocaleString('en-IN')}</td>
                    <td>{tx.description}</td>
                    <td>{new Date(tx.createdAt).toLocaleDateString('en-IN')}</td>
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

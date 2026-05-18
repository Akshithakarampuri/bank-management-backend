import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { accountAPI, customerAPI } from '../services/api';

const emptyForm = { accountType: 'SAVINGS', balance: '', status: 'ACTIVE' };
const emptyTxForm = { amount: '', description: '' };

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [txForm, setTxForm] = useState(emptyTxForm);
  const [txType, setTxType] = useState('deposit');
  const [toAccountId, setToAccountId] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([accountAPI.getAll(), customerAPI.getAll()])
      .then(([aR, cR]) => { setAccounts(aR.data); setCustomers(cR.data); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setSelectedCustomerId(''); setModal('add'); };
  const openEdit = (a) => { setSelected(a); setForm({ accountType: a.accountType, balance: a.balance, status: a.status }); setModal('edit'); };
  const openDelete = (a) => { setSelected(a); setModal('delete'); };
  const openTx = (a) => { setSelected(a); setTxForm(emptyTxForm); setTxType('deposit'); setToAccountId(''); setModal('transaction'); };
  const openHistory = async (a) => {
    setSelected(a);
    try {
      const r = await accountAPI.getTransactions(a.id);
      setTransactions(r.data);
    } catch { setTransactions([]); }
    setModal('history');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'add') {
        if (!selectedCustomerId) { toast.error('Select a customer'); setSaving(false); return; }
        await accountAPI.create(selectedCustomerId, form);
        toast.success('Account created!');
      } else {
        await accountAPI.update(selected.id, form);
        toast.success('Account updated!');
      }
      setModal(null); load();
    } catch (e) {
      toast.error(e.response?.data || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await accountAPI.delete(selected.id);
      toast.success('Account deleted');
      setModal(null); load();
    } catch (e) {
      toast.error(e.response?.data || 'Delete failed');
    } finally { setSaving(false); }
  };

  const handleTransaction = async () => {
    const amount = parseFloat(txForm.amount);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    setSaving(true);
    try {
      if (txType === 'deposit') {
        await accountAPI.deposit(selected.id, amount, txForm.description);
        toast.success('Deposit successful!');
      } else if (txType === 'withdraw') {
        await accountAPI.withdraw(selected.id, amount, txForm.description);
        toast.success('Withdrawal successful!');
      } else {
        if (!toAccountId) { toast.error('Select a destination account'); setSaving(false); return; }
        await accountAPI.transfer(selected.id, toAccountId, amount, txForm.description);
        toast.success('Transfer successful!');
      }
      setModal(null); load();
    } catch (e) {
      toast.error(e.response?.data || 'Transaction failed');
    } finally { setSaving(false); }
  };

  const statusBadge = (s) => ({ ACTIVE: 'badge-success', INACTIVE: 'badge-warning', CLOSED: 'badge-danger' }[s] || 'badge-navy');
  const typeBadge = (t) => ({ SAVINGS: 'badge-info', CHECKING: 'badge-navy', FIXED_DEPOSIT: 'badge-gold' }[t] || 'badge-navy');

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div><h1>Accounts</h1><p>Manage bank accounts and transactions</p></div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Account
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? <div className="empty-state"><p>Loading...</p></div>
            : accounts.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                <h3>No accounts yet</h3><p>Create the first account.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>Acc. No</th><th>Customer</th><th>Type</th><th>Balance</th><th>Status</th><th>Created</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {accounts.map(a => (
                    <tr key={a.id}>
                      <td className="font-mono">{a.accountNumber}</td>
                      <td>{a.customer?.firstName} {a.customer?.lastName}</td>
                      <td><span className={`badge ${typeBadge(a.accountType)}`}>{a.accountType?.replace('_', ' ')}</span></td>
                      <td><strong>₹{parseFloat(a.balance).toLocaleString('en-IN')}</strong></td>
                      <td><span className={`badge ${statusBadge(a.status)}`}>{a.status}</span></td>
                      <td>{a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : '-'}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-gold btn-sm" onClick={() => openTx(a)}>Transact</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => openHistory(a)}>History</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => openDelete(a)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>

      
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'add' ? 'New Account' : 'Edit Account'}</h2>
              <button className="btn-close" onClick={() => setModal(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="form-grid">
              {modal === 'add' && (
                <div className="form-group full">
                  <label>Customer *</label>
                  <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}>
                    <option value="">Select Customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.email}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Account Type *</label>
                <select value={form.accountType} onChange={e => setForm({ ...form, accountType: e.target.value })}>
                  <option value="SAVINGS">Savings</option>
                  <option value="CHECKING">Checking</option>
                  <option value="FIXED_DEPOSIT">Fixed Deposit</option>
                </select>
              </div>
              {modal === 'add' && (
                <div className="form-group">
                  <label>Initial Balance (₹)</label>
                  <input type="number" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} placeholder="0.00" min="0" />
                </div>
              )}
              {modal === 'edit' && (
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : modal === 'add' ? 'Create Account' : 'Update Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {modal === 'transaction' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Transaction</h2>
              <button className="btn-close" onClick={() => setModal(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>
              Account: <strong className="font-mono">{selected?.accountNumber}</strong> — Balance: <strong>₹{parseFloat(selected?.balance || 0).toLocaleString('en-IN')}</strong>
            </p>
            <div className="form-grid">
              <div className="form-group full">
                <label>Transaction Type</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['deposit', 'withdraw', 'transfer'].map(t => (
                    <button key={t} className={`btn ${txType === t ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setTxType(t)} style={{ flex: 1, textTransform: 'capitalize' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group full">
                <label>Amount (₹) *</label>
                <input type="number" value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })} placeholder="0.00" min="0" step="0.01" />
              </div>
              {txType === 'transfer' && (
                <div className="form-group full">
                  <label>To Account *</label>
                  <select value={toAccountId} onChange={e => setToAccountId(e.target.value)}>
                    <option value="">Select Destination Account</option>
                    {accounts.filter(a => a.id !== selected?.id && a.status === 'ACTIVE').map(a => (
                      <option key={a.id} value={a.id}>{a.accountNumber} — {a.customer?.firstName} {a.customer?.lastName}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group full">
                <label>Description</label>
                <input value={txForm.description} onChange={e => setTxForm({ ...txForm, description: e.target.value })} placeholder="Optional description" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className={`btn ${txType === 'deposit' ? 'btn-success' : txType === 'withdraw' ? 'btn-danger' : 'btn-gold'}`} onClick={handleTransaction} disabled={saving}>
                {saving ? 'Processing...' : `Confirm ${txType.charAt(0).toUpperCase() + txType.slice(1)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {modal === 'history' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transaction History</h2>
              <button className="btn-close" onClick={() => setModal(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Account: <strong className="font-mono">{selected?.accountNumber}</strong></p>
            {transactions.length === 0 ? (
              <div className="empty-state"><p>No transactions found.</p></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Type</th><th>Amount</th><th>Balance After</th><th>Description</th><th>Date</th></tr></thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.id}>
                        <td><span className={`badge ${tx.transactionType === 'DEPOSIT' ? 'badge-success' : tx.transactionType === 'WITHDRAWAL' ? 'badge-danger' : 'badge-info'}`}>{tx.transactionType}</span></td>
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Account</h2>
              <button className="btn-close" onClick={() => setModal(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Delete account <strong className="font-mono">{selected?.accountNumber}</strong>? This cannot be undone.</p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>{saving ? 'Deleting...' : 'Delete Account'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

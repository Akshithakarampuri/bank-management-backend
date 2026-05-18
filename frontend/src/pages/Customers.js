import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { customerAPI } from '../services/api';

const emptyForm = { firstName: '', lastName: '', email: '', phone: '', address: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    customerAPI.getAll()
      .then(r => setCustomers(r.data))
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setSelected(null); setModal('add'); };
  const openEdit = (c) => { setForm({ firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone, address: c.address }); setSelected(c); setModal('edit'); };
  const openDelete = (c) => { setSelected(c); setModal('delete'); };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      toast.error('Please fill all required fields'); return;
    }
    setSaving(true);
    try {
      if (modal === 'add') {
        await customerAPI.create(form);
        toast.success('Customer created!');
      } else {
        await customerAPI.update(selected.id, form);
        toast.success('Customer updated!');
      }
      setModal(null); load();
    } catch (e) {
      toast.error(e.response?.data || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await customerAPI.delete(selected.id);
      toast.success('Customer deleted');
      setModal(null); load();
    } catch (e) {
      toast.error(e.response?.data || 'Delete failed');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>Customers</h1>
          <p>Manage bank customer records</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Customer
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="empty-state"><p>Loading...</p></div>
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <h3>No customers yet</h3>
              <p>Add your first customer to get started.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Created</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td><span className="badge badge-navy">#{c.id}</span></td>
                    <td><strong>{c.firstName} {c.lastName}</strong></td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>{c.address}</td>
                    <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '-'}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => openDelete(c)}>Delete</button>
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
              <h2>{modal === 'add' ? 'Add Customer' : 'Edit Customer'}</h2>
              <button className="btn-close" onClick={() => setModal(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="John" />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" />
              </div>
              <div className="form-group full">
                <label>Address</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, City" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : modal === 'add' ? 'Create Customer' : 'Update Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'delete' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Customer</h2>
              <button className="btn-close" onClick={() => setModal(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
              Are you sure you want to delete <strong>{selected?.firstName} {selected?.lastName}</strong>? This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? 'Deleting...' : 'Delete Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

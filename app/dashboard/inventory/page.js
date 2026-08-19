




'use client';

import { useEffect, useState, useCallback } from 'react';
import styles from '../dashboard.module.css';
import { useToast } from '@/components/ToastContext';

const CATEGORIES = ['Antibiotics', 'Analgesics', 'Vitamins', 'Antacids', 'Antihypertensives', 'Antihistamines', 'Other'];
const EMPTY_FORM = { name: '', batch_number: '', manufacturer: '', manufactured_date: '', expiry_date: '', quantity: '', unit_price: '', category: '' };

function getDaysUntilExpiry(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

/* SVG icons */
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const PillIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
    <path d="m8.5 8.5 7 7"/>
  </svg>
);

/* Skeleton rows */
function SkeletonTableRows({ count = 6 }) {
  return Array.from({ length: count }, (_, i) => (
    <tr key={i}>
      {Array.from({ length: 9 }, (_, j) => (
        <td key={j}><div className="skeleton" style={{ height: 13, borderRadius: 6, width: j === 0 ? '80%' : '60%' }} /></td>
      ))}
    </tr>
  ));
}

/* Delete confirm dialog */
function ConfirmDialog({ message, onConfirm, onCancel, disabled }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox} style={{ maxWidth: 400, padding: 28 }}>
        <div className={styles.modalTitle} style={{ marginBottom: 12 }}>Confirm deletion</div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 24 }}>{message}</p>
        <div className={styles.modalActions}>
          <button className={styles.btnCancel} onClick={onCancel} disabled={disabled}>Cancel</button>
          <button className={styles.btnSubmit} style={{ background: 'var(--danger)' }} onClick={onConfirm} disabled={disabled}>
            {disabled ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const toast = useToast();
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editId, setEditId]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId]     = useState(null);

  const fetchMedicines = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const res = await fetch(`/api/inventory?${params}`);
    const data = await res.json();
    setMedicines(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

  const filtered = category
    ? medicines.filter(m => m.category === category)
    : medicines;

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setError(''); setShowForm(true); };
  const openEdit = (med) => {
    setForm({
      name: med.name, batch_number: med.batch_number, manufacturer: med.manufacturer,
      manufactured_date: med.manufactured_date?.split('T')[0] || '',
      expiry_date: med.expiry_date?.split('T')[0] || '',
      quantity: med.quantity, unit_price: med.unit_price, category: med.category || '',
    });
    setEditId(med.id); setError(''); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    const url    = editId ? `/api/inventory/${editId}` : '/api/inventory';
    const method = editId ? 'PUT' : 'POST';
    const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data   = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Failed to save.'); return; }
    setShowForm(false);
    await fetchMedicines();
    toast(editId ? `${form.name} updated.` : `${form.name} added to inventory.`, 'success');
  };

  const handleDelete = async () => {
    if (!deleteTarget || deletingId) return;
    setDeletingId(deleteTarget.id);
    try {
      const res = await fetch(`/api/inventory/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || 'Failed to delete medicine.', 'error');
      } else {
        toast(`${deleteTarget.name} removed from inventory.`, 'success');
        await fetchMedicines();
      }
    } catch (err) {
      console.error(err);
      toast('A network error occurred while deleting.', 'error');
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  const getBadge = (days) => {
    if (days <= 0)  return <span className={`${styles.badge} ${styles.badgeDanger}`}>Expired</span>;
    if (days <= 7)  return <span className={`${styles.badge} ${styles.badgeDanger}`}>{days}d left</span>;
    if (days <= 30) return <span className={`${styles.badge} ${styles.badgeWarning}`}>{days}d left</span>;
    return <span className={`${styles.badge} ${styles.badgeSuccess}`}>OK</span>;
  };

  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Inventory</h1>
        <p className={styles.pageSubtitle}>Manage medicine stock, batch details and expiry dates.</p>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}><SearchIcon /></span>
          <input
            className={styles.searchInput}
            placeholder="Search medicines…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className={styles.filterSelect} value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button id="add-medicine-btn" className={styles.addBtn} onClick={openAdd}>
          <PlusIcon /> Add Medicine
        </button>
      </div>

      <div className={styles.card}>
        {loading ? (
          <table className={styles.table}>
            <thead><tr>
              {['Name','Batch','Manufacturer','Category','Qty','Price','Expiry','Status',''].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody><SkeletonTableRows /></tbody>
          </table>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}><PillIcon /></div>
            <div className={styles.emptyStateTitle}>No medicines found</div>
            <div className={styles.emptyStateSub}>{search ? 'Try a different search term or clear filters.' : 'Add your first medicine to get started.'}</div>
            {!search && (
              <button className="btn-primary" style={{ width: 'auto', marginTop: 12, padding: '9px 20px', fontSize: '0.875rem' }} onClick={openAdd}>
                <PlusIcon /> Add Medicine
              </button>
            )}
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th><th>Batch</th><th>Manufacturer</th><th>Category</th>
                <th>Qty</th><th>Price</th><th>Expiry</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(med => {
                const days = getDaysUntilExpiry(med.expiry_date);
                return (
                  <tr key={med.id}>
                    <td><strong style={{ color: 'var(--text)' }}>{med.name}</strong></td>
                    <td><code style={{ fontSize: '0.78rem', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4 }}>{med.batch_number}</code></td>
                    <td>{med.manufacturer}</td>
                    <td>{med.category ? <span className={`${styles.badge} ${styles.badgeAccent}`}>{med.category}</span> : <span style={{ color: 'var(--text-faint)' }}>—</span>}</td>
                    <td style={{ fontWeight: 600, color: med.quantity < 10 ? 'var(--warning)' : 'var(--text)' }}>{med.quantity}</td>
                    <td>₹{med.unit_price}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>{new Date(med.expiry_date).toLocaleDateString('en-IN')}</td>
                    <td>{getBadge(days)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className={`${styles.btnSm} ${styles.btnSmPrimary}`} onClick={() => openEdit(med)}><EditIcon /> Edit</button>
                        <button className={`${styles.btnSm} ${styles.btnSmDanger}`} onClick={() => setDeleteTarget(med)}><TrashIcon /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editId ? 'Edit Medicine' : 'Add New Medicine'}</h2>
              <button className={`${styles.btnSm} ${styles.btnSmGhost}`} onClick={() => setShowForm(false)} style={{ padding: '6px 8px' }}><CloseIcon /></button>
            </div>
            {error && <div className="alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                {[
                  { label: 'Medicine Name *', key: 'name', type: 'text', full: true },
                  { label: 'Batch Number *', key: 'batch_number', type: 'text' },
                  { label: 'Manufacturer *', key: 'manufacturer', type: 'text' },
                  { label: 'Manufactured Date *', key: 'manufactured_date', type: 'date' },
                  { label: 'Expiry Date *', key: 'expiry_date', type: 'date' },
                  { label: 'Quantity *', key: 'quantity', type: 'number' },
                  { label: 'Unit Price (₹) *', key: 'unit_price', type: 'number' },
                ].map(({ label, key, type, full }) => (
                  <div key={key} className={`input-group ${full ? styles.formGridFull : ''}`} style={{ marginBottom: 0 }}>
                    <label className="input-label">{label}</label>
                    <input
                      type={type}
                      className="input-field"
                      value={form[key]}
                      onChange={f(key)}
                      min={type === 'number' ? 0 : undefined}
                      step={key === 'unit_price' ? '0.01' : undefined}
                      required
                    />
                  </div>
                ))}
                <div className={`input-group ${styles.formGridFull}`} style={{ marginBottom: 0 }}>
                  <label className="input-label">Category</label>
                  <select className="input-field" value={form.category} onChange={f('category')}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className={styles.btnSubmit} disabled={saving}>
                  {saving ? 'Saving…' : editId ? 'Update Medicine' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          disabled={deletingId !== null}
        />
      )}
    </>
  );
}

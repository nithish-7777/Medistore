'use client';

import { useEffect, useState } from 'react';
import styles from '../dashboard.module.css';
import { useToast } from '@/components/ToastContext';

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const HistoryIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
    <path d="M12 7v5l4 2"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

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

function SkeletonTableRows({ cols = 5, count = 5 }) {
  return Array.from({ length: count }, (_, i) => (
    <tr key={i}>
      {Array.from({ length: cols }, (_, j) => (
        <td key={j}><div className="skeleton" style={{ height: 13, borderRadius: 6, width: j === 0 ? '70%' : '55%' }} /></td>
      ))}
    </tr>
  ));
}

export default function CustomersPage() {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected]   = useState(null);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId]     = useState(null);

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(data => {
      setCustomers(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget || deletingId) return;
    setDeletingId(deleteTarget.id);
    try {
      const res = await fetch(`/api/customers/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || 'Failed to delete customer.', 'error');
      } else {
        toast(`${deleteTarget.name} removed successfully.`, 'success');
        setCustomers(prev => prev.filter(c => c.id !== deleteTarget.id));
        if (selected?.id === deleteTarget.id) {
          setSelected(null);
        }
      }
    } catch (err) {
      console.error(err);
      toast('A network error occurred while deleting.', 'error');
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile_number.includes(search)
  );

  const smsOptedIn = customers.filter(c => c.sms_consent).length;

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Customers</h1>
        <p className={styles.pageSubtitle}>View customer profiles, purchase history and SMS consent status.</p>
      </div>

      {/* Summary KPI strip */}
      {!loading && (
        <div className={styles.kpiGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
          {[
            { label: 'Total Customers', value: customers.length, variant: 'accent' },
            { label: 'SMS Opted In', value: smsOptedIn, variant: 'success' },
            { label: 'Opted Out', value: customers.length - smsOptedIn, variant: '' },
          ].map(({ label, value, variant }) => (
            <div key={label} className={`${styles.kpiCard} ${variant ? styles[variant] : ''}`}>
              <div className={styles.kpiValue}>{value}</div>
              <div className={styles.kpiLabel}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: 20 }}>
        {/* Customer list */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}><UsersIcon /> All Customers ({filtered.length})</span>
            <div className={styles.searchWrap} style={{ maxWidth: 220 }}>
              <span className={styles.searchIcon}><SearchIcon /></span>
              <input
                className={styles.searchInput}
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <table className={styles.table}>
              <thead><tr><th>Name</th><th>Mobile</th><th>SMS</th><th>Purchases</th><th></th></tr></thead>
              <tbody><SkeletonTableRows /></tbody>
            </table>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}><UsersIcon /></div>
              <div className={styles.emptyStateTitle}>No customers yet</div>
              <div className={styles.emptyStateSub}>Customers are added automatically when you record a sale.</div>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr><th>Name</th><th>Mobile</th><th>SMS Consent</th><th>Purchases</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td><strong style={{ color: 'var(--text)' }}>{c.name}</strong></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.83rem' }}>{c.mobile_number}</td>
                    <td>
                      {c.sms_consent
                        ? <span className={`${styles.badge} ${styles.badgeSuccess}`}>Opted In</span>
                        : <span className={`${styles.badge} ${styles.badgeDanger}`}>No Consent</span>}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>{c.sales?.length || 0}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className={`${styles.btnSm} ${selected?.id === c.id ? styles.btnSmDanger : styles.btnSmPrimary}`}
                          onClick={() => setSelected(selected?.id === c.id ? null : c)}
                        >
                          {selected?.id === c.id ? <CloseIcon /> : <HistoryIcon />}
                          {selected?.id === c.id ? 'Close' : 'History'}
                        </button>
                        <button
                          className={`${styles.btnSm} ${styles.btnSmDanger}`}
                          onClick={() => setDeleteTarget(c)}
                        >
                          <TrashIcon /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Purchase history panel */}
        {selected && (
          <div className={styles.customerDrawer}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>{selected.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: 2 }}>
                  {selected.mobile_number} · {selected.sales?.length || 0} purchase(s)
                </div>
              </div>
              <button
                className={`${styles.btnSm} ${styles.btnSmGhost}`}
                onClick={() => setSelected(null)}
                style={{ padding: '6px 8px' }}
              >
                <CloseIcon />
              </button>
            </div>

            {!selected.sales?.length ? (
              <div className={styles.emptyState} style={{ padding: '32px 16px' }}>
                <div className={styles.emptyStateIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                  </svg>
                </div>
                <div className={styles.emptyStateTitle}>No purchases yet</div>
              </div>
            ) : (
              <div style={{ overflowY: 'auto', maxHeight: 520 }}>
                {selected.sales.map(sale => (
                  <div key={sale.id} className={styles.saleRecord}>
                    <div className={styles.saleRecordHeader}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {new Date(sale.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      <span className={styles.saleAmount}>₹{sale.total_amount.toFixed(2)}</span>
                    </div>
                    {sale.saleItems?.map(item => (
                      <div key={item.id} className={styles.saleItem}>
                        {item.medicine?.name} × {item.quantity} @ ₹{item.unit_price_at_sale}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Lifetime stats */}
            <div style={{ padding: '16px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 24 }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lifetime spend</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>
                  ₹{(selected.sales?.reduce((s, sale) => s + sale.total_amount, 0) || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transactions</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{selected.sales?.length || 0}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          message={`Are you sure you want to delete customer "${deleteTarget.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          disabled={deletingId !== null}
        />
      )}
    </>
  );
}

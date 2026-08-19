'use client';

import { useEffect, useState } from 'react';
import styles from '../dashboard.module.css';
import { useToast } from '@/components/ToastContext';

const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4m0 4h.01"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

function SkeletonAlertCard() {
  return (
    <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border)' }}>
      <div className="skeleton" style={{ height: 15, width: '45%', marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 12, width: '70%', marginBottom: 8 }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <div className="skeleton" style={{ height: 26, width: 80, borderRadius: 99 }} />
        <div className="skeleton" style={{ height: 26, width: 120, borderRadius: 99 }} />
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const toast = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);

  const refresh = async () => {
    setSpinning(true);
    setLoading(true);
    const data = await fetch('/api/alerts/expiring').then(r => r.json());
    setAlerts(data.alerts || []);
    setLoading(false);
    setSpinning(false);
    toast(`Found ${(data.alerts || []).length} expiry alert(s).`, 'info');
  };

  useEffect(() => {
    let active = true;
    const loadAlerts = async () => {
      try {
        const res = await fetch('/api/alerts/expiring');
        const data = await res.json();
        if (active) {
          setAlerts(data.alerts || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadAlerts();
    return () => { active = false; };
  }, []);

  const daysLeft = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

  const urgencyConfig = (days) => {
    if (days <= 0)  return { color: 'var(--danger)',  bg: 'var(--danger-dim)',  label: 'Expired',          badgeClass: styles.badgeDanger  };
    if (days <= 3)  return { color: 'var(--danger)',  bg: 'var(--danger-dim)',  label: `${days}d left`,    badgeClass: styles.badgeDanger  };
    if (days <= 7)  return { color: 'var(--warning)', bg: 'var(--warning-dim)', label: `${days}d left`,    badgeClass: styles.badgeWarning };
    return           { color: 'var(--success)', bg: 'var(--success-dim)', label: 'OK',               badgeClass: styles.badgeSuccess };
  };

  const expired = alerts.filter(a => daysLeft(a.medicine.expiry_date) <= 0).length;
  const critical = alerts.filter(a => { const d = daysLeft(a.medicine.expiry_date); return d > 0 && d <= 3; }).length;
  const warning  = alerts.filter(a => { const d = daysLeft(a.medicine.expiry_date); return d > 3 && d <= 7; }).length;

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Expiry Alerts</h1>
        <p className={styles.pageSubtitle}>Medicines expiring within 7 days and customers to notify via SMS.</p>
      </div>

      {/* Summary strip */}
      {!loading && (
        <div className={styles.kpiGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
          {[
            { label: 'Total Alerts', value: alerts.length,  variant: alerts.length > 0 ? 'warning' : '' },
            { label: 'Expired',      value: expired,         variant: expired > 0 ? 'danger' : ''  },
            { label: 'Critical (≤3d)', value: critical,      variant: critical > 0 ? 'danger' : '' },
            { label: 'Warning (≤7d)', value: warning,        variant: warning > 0 ? 'warning' : '' },
          ].map(({ label, value, variant }) => (
            <div key={label} className={`${styles.kpiCard} ${variant ? styles[variant] : ''}`}>
              <div className={styles.kpiValue}>{value}</div>
              <div className={styles.kpiLabel}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>
            <AlertIcon />
            Expiring Soon ({alerts.length})
          </span>
          <button
            className={`${styles.btnSm} ${styles.btnSmPrimary}`}
            onClick={refresh}
            disabled={spinning}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span style={{ display: 'inline-block', animation: spinning ? 'spin 0.8s linear infinite' : 'none' }}>
              <RefreshIcon />
            </span>
            Refresh
          </button>
        </div>

        {loading ? (
          Array.from({ length: 4 }, (_, i) => <SkeletonAlertCard key={i} />)
        ) : alerts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon} style={{ background: 'var(--success-dim)', color: 'var(--success)' }}>
              <CheckIcon />
            </div>
            <div className={styles.emptyStateTitle}>All clear — no expiry alerts</div>
            <div className={styles.emptyStateSub}>No medicines expiring within the next 7 days. Everything looks good.</div>
          </div>
        ) : (
          alerts.map(({ medicine, affectedCustomers }) => {
            const days   = daysLeft(medicine.expiry_date);
            const config = urgencyConfig(days);
            return (
              <div key={medicine.id} className={styles.alertCard}>
                <div className={styles.alertUrgencyBar} style={{ background: config.color }} />
                <div className={styles.alertBody} style={{ paddingLeft: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <div className={styles.alertMedName}>{medicine.name}</div>
                    <span className={`${styles.badge} ${config.badgeClass}`}>{config.label}</span>
                    <span className={`${styles.badge} ${styles.badgeAccent}`}>{medicine.quantity} units</span>
                  </div>
                  <div className={styles.alertMeta}>
                    Batch: <strong>{medicine.batch_number}</strong>&nbsp;·&nbsp;
                    Mfr: <strong>{medicine.manufacturer}</strong>&nbsp;·&nbsp;
                    Expires: <strong>{new Date(medicine.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                  </div>

                  {affectedCustomers.length === 0 ? (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                      </svg>
                      No opted-in customers purchased this medicine.
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.93 3.26 2 2 0 0 1 3.9 1h3a2 2 0 0 1 2 1.72A12.84 12.84 0 0 0 10.25 6a2 2 0 0 1-.45 2.11L8.09 9.91A16 16 0 0 0 14 15.87l1.8-1.8a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 3.28.59A2 2 0 0 1 23 16z"/>
                        </svg>
                        SMS alert will be sent to {affectedCustomers.length} customer(s):
                      </div>
                      <div className={styles.alertCustomerChips}>
                        {affectedCustomers.map(c => (
                          <div key={c.id} className={styles.customerChip}>
                            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{c.name}</span>
                            <span style={{ color: 'var(--text-faint)' }}>{c.mobile_number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info note */}
      <div className={styles.card} style={{ marginTop: 16, padding: '18px 22px' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--warning)' }}>SMS Integration:</strong>{' '}
          SMS alerts are dispatched to customers who opted in during purchase. Refresh alerts to re-trigger the queue.
          Configure Twilio credentials in <code style={{ background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4, fontSize: '0.78rem' }}>/app/api/alerts/expiring/route.js</code>.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

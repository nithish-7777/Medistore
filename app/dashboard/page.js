'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';

/* ---- SVG Icons ---- */
const AlertTriIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4m0 4h.01"/>
  </svg>
);
const PillIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
    <path d="m8.5 8.5 7 7"/>
  </svg>
);
const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const TrendUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const BoxIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const DatabaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>
  </svg>
);

/* ---- Skeleton placeholder ---- */
function SkeletonKPI() {
  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiIconRow}>
        <div className={`${styles.kpiIcon} skeleton`} style={{ width: 36, height: 36 }} />
      </div>
      <div className="skeleton" style={{ width: '60%', height: 36, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: '80%', height: 13 }} />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className={styles.skeletonRow}>
      <div className={`skeleton ${styles.skeletonCell}`} style={{ flex: 2 }} />
      <div className={`skeleton ${styles.skeletonCell}`} style={{ flex: 1 }} />
      <div className={`skeleton ${styles.skeletonCell}`} style={{ flex: 1 }} />
      <div className={`skeleton ${styles.skeletonCell}`} style={{ flex: 1 }} />
    </div>
  );
}

/* ---- Sparkline using Chart.js CDN ---- */
function Sparkline({ data, color = '#00a896' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data?.length || !canvasRef.current) return;

    const draw = () => {
      if (!window.Chart) return;
      const ctx = canvasRef.current.getContext('2d');
      if (canvasRef.current._chartInstance) canvasRef.current._chartInstance.destroy();
      canvasRef.current._chartInstance = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map((_, i) => i),
          datasets: [{
            data,
            borderColor: color,
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            backgroundColor: `${color}22`,
            tension: 0.4,
          }],
        },
        options: {
          responsive: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: { x: { display: false }, y: { display: false } },
          animation: { duration: 600 },
        },
      });
    };

    if (window.Chart) { draw(); return; }
    const script = document.getElementById('chartjs-cdn');
    if (script) { script.addEventListener('load', draw); return; }
    const s = document.createElement('script');
    s.id  = 'chartjs-cdn';
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';
    s.onload = draw;
    document.head.appendChild(s);
  }, [data, color]);

  return <canvas ref={canvasRef} width={120} height={40} />;
}

/* ---- Donut chart ---- */
function StockDonut({ low, normal, expired }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const draw = () => {
      if (!window.Chart) return;
      const ctx = canvasRef.current.getContext('2d');
      if (canvasRef.current._chartInstance) canvasRef.current._chartInstance.destroy();
      canvasRef.current._chartInstance = new window.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Low Stock', 'Normal', 'Expired'],
          datasets: [{
            data: [low, normal, expired],
            backgroundColor: ['#d97706', '#00a896', '#dc2626'],
            borderWidth: 0,
            hoverOffset: 4,
          }],
        },
        options: {
          responsive: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.raw}` } },
          },
          cutout: '72%',
        },
      });
    };

    if (window.Chart) { draw(); return; }
    let s = document.getElementById('chartjs-cdn');
    if (!s) {
      s = document.createElement('script');
      s.id  = 'chartjs-cdn';
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';
      document.head.appendChild(s);
    }
    s.addEventListener('load', draw);
  }, [low, normal, expired]);

  return <canvas ref={canvasRef} width={120} height={120} />;
}

export default function DashboardPage() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load dashboard statistics.');
        return res.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const totalMedicines      = stats?.totalMedicines || 0;
  const totalStockUnits     = stats?.totalStockUnits || 0;
  const totalCustomers      = stats?.totalCustomers || 0;
  const smsOptedInCustomers = stats?.smsOptedInCustomers || 0;
  const lowStock            = stats?.lowStock || 0;
  const expired             = stats?.expired || 0;
  const expiringSoon        = stats?.expiringSoon || 0;
  const todayRevenue        = stats?.todayRevenue || 0;
  const todaySalesCount     = stats?.todaySalesCount || 0;
  const last7DaysRevenue    = stats?.last7DaysRevenue || [0, 0, 0, 0, 0, 0, 0];
  const sales               = stats?.recentSales || [];
  const alerts              = stats?.alerts || [];

  const okStock = totalMedicines - lowStock - expired;

  const kpis = [
    {
      value: totalMedicines,
      label: 'Total Products',
      icon: <DatabaseIcon />,
      variant: 'accent',
      trend: 'Registered medicines',
    },
    {
      value: totalStockUnits,
      label: 'Total Stock Units',
      icon: <BoxIcon />,
      variant: 'success',
      trend: 'Total units in inventory',
    },
    {
      value: lowStock,
      label: 'Low Inventory',
      icon: <PillIcon />,
      variant: lowStock > 0 ? 'warning' : '',
      trend: 'Items with fewer than 10 units',
    },
    {
      value: expiringSoon,
      label: 'Expiring Soon',
      icon: <AlertTriIcon />,
      variant: expiringSoon > 0 ? 'danger' : '',
      trend: 'Medicines within 7 days',
    },
    {
      value: `₹${todayRevenue.toFixed(0)}`,
      label: "Today's Revenue",
      icon: <CartIcon />,
      variant: 'success',
      trend: `${todaySalesCount} transaction${todaySalesCount !== 1 ? 's' : ''}`,
      sparkline: last7DaysRevenue,
    },
    {
      value: totalCustomers,
      label: 'Active Customers',
      icon: <UsersIcon />,
      variant: 'accent',
      trend: `${smsOptedInCustomers} opted in for SMS`,
    },
  ];

  return (
    <>
      {/* ---- Header ---- */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageSubtitle}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: 20 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
          </svg>
          {error}
        </div>
      )}

      {/* ---- KPI Grid ---- */}
      <div className={styles.kpiGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {loading
          ? Array.from({ length: 6 }, (_, i) => <SkeletonKPI key={i} />)
          : kpis.map(({ value, label, icon, variant, trend, sparkline }) => (
            <div key={label} className={`${styles.kpiCard} ${variant ? styles[variant] : ''}`}>
              <div className={styles.kpiIconRow}>
                <div className={`${styles.kpiIcon} ${variant ? styles[variant] : ''}`}>{icon}</div>
                {sparkline && <Sparkline data={sparkline} />}
              </div>
              <div className={styles.kpiValue}>{value}</div>
              <div className={styles.kpiLabel}>{label}</div>
              <div className={styles.kpiTrend}>{trend}</div>
            </div>
          ))
        }
      </div>

      {/* ---- Bento Grid ---- */}
      <div className={styles.bentoGrid}>

        {/* Wide: Recent Sales */}
        <div className={styles.bentoWide}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>
                <CartIcon /> Recent Sales
              </span>
              <Link href="/dashboard/customers" className={styles.cardLink}>View all →</Link>
            </div>

            {loading ? (
              Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} />)
            ) : sales.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}><CartIcon /></div>
                <div className={styles.emptyStateTitle}>No sales recorded yet</div>
                <div className={styles.emptyStateSub}>Head to the New Sale page to record your first transaction.</div>
                <Link href="/dashboard/pos">
                  <button className="btn-primary" style={{ width: 'auto', marginTop: 8, padding: '8px 20px', fontSize: '0.875rem' }}>
                    <PlusIcon /> New Sale
                  </button>
                </Link>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Mobile</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map(sale => (
                    <tr key={sale.id}>
                      <td><strong>{sale.customer?.name || '—'}</strong></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{sale.customer?.mobile_number}</td>
                      <td>{sale.saleItems?.length} item(s)</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{sale.total_amount.toFixed(2)}</td>
                      <td style={{ color: 'var(--text-faint)' }}>{new Date(sale.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Narrow: Alerts + Stock donut */}
        <div className={styles.bentoNarrow} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Stock health donut */}
          {!loading && !error && (
            <div className={styles.card} style={{ padding: 22 }}>
              <div className={styles.cardTitle} style={{ marginBottom: 16 }}>
                <PillIcon /> Stock Health
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <StockDonut low={lowStock} normal={okStock} expired={expired} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Normal',   val: okStock,  color: 'var(--accent)' },
                    { label: 'Low',      val: lowStock,  color: 'var(--warning)' },
                    { label: 'Expired',  val: expired,   color: 'var(--danger)' },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginLeft: 'auto' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Expiry alerts card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}><AlertTriIcon /> Expiry Alerts</span>
              <Link href="/dashboard/alerts" className={styles.cardLink}>View all →</Link>
            </div>

            {loading ? (
              Array.from({ length: 3 }, (_, i) => (
                <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div className="skeleton" style={{ height: 13, width: '70%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 11, width: '50%' }} />
                </div>
              ))
            ) : alerts.length === 0 ? (
              <div className={styles.emptyState} style={{ padding: '32px 16px' }}>
                <div className={styles.emptyStateIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className={styles.emptyStateTitle}>All clear</div>
                <div className={styles.emptyStateSub}>No medicines expiring within 7 days.</div>
              </div>
            ) : (
              alerts.map(({ medicine }) => {
                const days = Math.ceil((new Date(medicine.expiry_date) - new Date()) / 86400000);
                const isExpired = days <= 0;
                const color = isExpired ? 'var(--danger)' : days <= 3 ? 'var(--warning)' : 'var(--warning)';
                return (
                  <div key={medicine.id} className={styles.alertCard} style={{ padding: '14px 20px' }}>
                    <div className={styles.alertUrgencyBar} style={{ background: color }} />
                    <div style={{ paddingLeft: 12 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
                        {medicine.name}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span className={`${styles.badge} ${isExpired ? styles.badgeDanger : styles.badgeWarning}`}>
                          {isExpired ? 'Expired' : `${days}d left`}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                          {medicine.quantity} units
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick actions */}
          <div className={styles.card} style={{ padding: 20 }}>
            <div className={styles.cardTitle} style={{ marginBottom: 14 }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/dashboard/pos" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <CartIcon /> New Sale
                </button>
              </Link>
              <Link href="/dashboard/inventory" style={{ textDecoration: 'none' }}>
                <button className={`${styles.btnSm} ${styles.btnSmGhost}`} style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
                  <PlusIcon /> Add Medicine
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

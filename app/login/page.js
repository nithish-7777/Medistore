'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Invalid credentials'); setLoading(false); return; }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Could not connect to the server.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>

      {/* ── LEFT BRAND PANEL ── */}
      <div className={styles.leftPanel}>
        <div className={styles.leftGrid} />
        <div className={styles.leftContent}>
          <div className={styles.leftBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
              <path d="m8.5 8.5 7 7"/>
            </svg>
            Pharmacy Intelligence
          </div>
          <h1 className={styles.leftTitle}>
            Modern pharmacy<br /><span>management.</span>
          </h1>
          <p className={styles.leftDesc}>
            Track inventory, catch expirations before they happen, manage customers, and process sales — all in one place.
          </p>
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>99.9%</span>
              <span className={styles.statDesc}>Uptime</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>7-day</span>
              <span className={styles.statDesc}>Expiry Alerts</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>SMS</span>
              <span className={styles.statDesc}>Notifications</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className={styles.rightPanel}>
        <div className={styles.formCard}>

          {/* Brand mark */}
          <div className={styles.formTopBrand}>
            <div className={styles.logoMark}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                <path d="m8.5 8.5 7 7"/>
              </svg>
            </div>
            <span className={styles.brandName}>MediStore</span>
          </div>

          <h2 className={styles.formTitle}>Welcome back</h2>
          <p className={styles.formSubtitle}>Sign in to your pharmacy dashboard</p>

          {error && (
            <div className="alert-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <div className="input-group">
              <label className="input-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="input-field"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. admin"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input-field"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Authenticating…
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: '0.8125rem', color: 'var(--text-faint)', textAlign: 'center' }}>
            MediStore Admin · Pharmacy Management System
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from './ThemeProvider';
import styles from './Sidebar.module.css';

/* ---- SVG Icon Library ---- */
const Icons = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Inventory: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7z"/>
      <path d="M3 14h3v3H3zM9 14h1m-1 3h1M6 20h1"/>
    </svg>
  ),
  Pill: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
      <path d="m8.5 8.5 7 7"/>
    </svg>
  ),
  Sale: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  ),
  Customers: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Alert: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <path d="M12 9v4m0 4h.01"/>
    </svg>
  ),
  Sun: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  ),
  Moon: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

const NAV_LINKS = [
  { href: '/dashboard',            label: 'Dashboard', Icon: Icons.Dashboard },
  { href: '/dashboard/inventory',  label: 'Inventory',  Icon: Icons.Pill },
  { href: '/dashboard/pos',        label: 'New Sale',   Icon: Icons.Sale },
  { href: '/dashboard/customers',  label: 'Customers',  Icon: Icons.Customers },
  { href: '/dashboard/alerts',     label: 'Alerts',     Icon: Icons.Alert },
];

const SidebarContent = ({ theme, toggleTheme, handleLogout, isActive, setDrawerOpen }) => (
  <>
    {/* Brand */}
    <div className={styles.brand}>
      <div className={styles.logoMark}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
          <path d="m8.5 8.5 7 7"/>
        </svg>
      </div>
      <span className={styles.brandName}>MediStore</span>
    </div>

    {/* Nav */}
    <nav className={styles.nav} role="navigation" aria-label="Main navigation">
      <div className={styles.navSection}>
        <span className={styles.navLabel}>Menu</span>
        {NAV_LINKS.map(({ href, label, Icon }) => (
          <a
            key={href}
            href={href}
            className={`${styles.navLink} ${isActive(href) ? styles.active : ''}`}
            onClick={() => setDrawerOpen(false)}
            aria-current={isActive(href) ? 'page' : undefined}
          >
            <span className={styles.navIcon}><Icon /></span>
            <span>{label}</span>
            {isActive(href) && <span className={styles.activeDot} />}
          </a>
        ))}
      </div>
    </nav>

    {/* Footer */}
    <div className={styles.footer}>
      <button
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <span className={styles.themeIconWrap}>
          {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
        </span>
        <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
      </button>
      <button className={styles.logoutBtn} onClick={handleLogout}>
        <Icons.Logout />
        <span>Logout</span>
      </button>
    </div>
  </>
);

export default function Sidebar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const isActive = (href) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <>
      {/* ---- Desktop Sidebar ---- */}
      <aside className={styles.sidebar} aria-label="Sidebar">
        <SidebarContent 
          theme={theme}
          toggleTheme={toggleTheme}
          handleLogout={handleLogout}
          isActive={isActive}
          setDrawerOpen={setDrawerOpen}
        />
      </aside>

      {/* ---- Mobile Top Bar ---- */}
      <header className={styles.mobileTopBar}>
        <div className={styles.mobileBrand}>
          <div className={styles.logoMarkSm}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
              <path d="m8.5 8.5 7 7"/>
            </svg>
          </div>
          <span className={styles.brandNameSm}>MediStore</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={styles.iconBtn} onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
          </button>
          <button className={styles.iconBtn} onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Icons.Menu />
          </button>
        </div>
      </header>

      {/* ---- Mobile Drawer ---- */}
      {drawerOpen && (
        <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button className={styles.iconBtn} onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <Icons.Close />
              </button>
            </div>
            <SidebarContent 
              theme={theme}
              toggleTheme={toggleTheme}
              handleLogout={handleLogout}
              isActive={isActive}
              setDrawerOpen={setDrawerOpen}
            />
          </div>
        </div>
      )}

      {/* ---- Mobile Bottom Tab Bar ---- */}
      <nav className={styles.bottomBar} aria-label="Mobile navigation">
        {NAV_LINKS.map(({ href, label, Icon }) => (
          <a
            key={href}
            href={href}
            className={`${styles.tabItem} ${isActive(href) ? styles.tabActive : ''}`}
            aria-current={isActive(href) ? 'page' : undefined}
          >
            <Icon />
            <span className={styles.tabLabel}>{label}</span>
          </a>
        ))}
      </nav>
    </>
  );
}

import Sidebar from '@/components/Sidebar';
import { ToastProvider } from '@/components/ToastContext';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }) {
  return (
    <ToastProvider>
      <div className={styles.dashboardLayout}>
        <Sidebar />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}

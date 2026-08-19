'use client';

import { createContext, useContext, useCallback, useReducer } from 'react';

const ToastCtx = createContext(null);

let _id = 0;

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':    return [...state, action.toast];
    case 'REMOVE': return state.filter(t => t.id !== action.id);
    default:       return state;
  }
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, []);

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++_id;
    dispatch({ type: 'ADD', toast: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE', id }), duration);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map(t => (
          <Toast key={t.id} {...t} onClose={() => dispatch({ type: 'REMOVE', id: t.id })} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}

/* -------- Toast UI -------- */
function Toast({ type, message, onClose }) {
  const colors = {
    success: { bg: 'var(--success-dim)', border: 'var(--success)', color: 'var(--success)' },
    error:   { bg: 'var(--danger-dim)',  border: 'var(--danger)',  color: 'var(--danger)' },
    info:    { bg: 'var(--accent-dim)',  border: 'var(--accent)',  color: 'var(--accent)' },
  };
  const c = colors[type] || colors.info;

  const icons = {
    success: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    error:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    info:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>,
  };

  return (
    <div role="alert" style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'var(--surface)', color: c.color,
      border: `1px solid ${c.border}`,
      borderLeft: `3px solid ${c.border}`,
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      minWidth: 280, maxWidth: 380,
      boxShadow: 'var(--shadow-lg)',
      animation: 'slideInRight 0.25s cubic-bezier(0.4,0,0.2,1)',
      pointerEvents: 'all',
      cursor: 'default',
    }}>
      <span style={{ flexShrink: 0, color: c.color }}>{icons[type] || icons.info}</span>
      <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>{message}</span>
      <button
        onClick={onClose}
        aria-label="Close notification"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', padding: 4, borderRadius: 4,
          display: 'flex', alignItems: 'center', flexShrink: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '../dashboard.module.css';
import { useToast } from '@/components/ToastContext';

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const PrintIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);


function SkeletonMedRows({ count = 5 }) {
  return Array.from({ length: count }, (_, i) => (
    <tr key={i}>
      {[2, 1, 1, 1, 1].map((w, j) => (
        <td key={j}><div className="skeleton" style={{ height: 13, borderRadius: 6, width: `${w * 40}%` }} /></td>
      ))}
    </tr>
  ));
}

export default function POSPage() {
  const toast = useToast();
  const receiptRef = useRef(null);
  const dropdownRef = useRef(null);

  const [medicines, setMedicines]             = useState([]);
  const [search, setSearch]                   = useState('');
  const [cart, setCart]                       = useState([]);
  const [customerMode, setCustomerMode]       = useState('existing'); // 'existing' | 'new'
  const [customerList, setCustomerList]       = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch]   = useState('');
  const [showDropdown, setShowDropdown]       = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerName, setCustomerName]       = useState('');
  const [mobileNumber, setMobileNumber]       = useState('');
  const [smsConsent, setSmsConsent]           = useState(false);
  const [loading, setLoading]                 = useState(true);
  const [processing, setProcessing]           = useState(false);
  const [lastReceipt, setLastReceipt]         = useState(null);
  const [error, setError]                     = useState('');

  const fetchCustomers = () => {
    setLoadingCustomers(true);
    fetch('/api/customers')
      .then(r => r.json())
      .then(data => {
        setCustomerList(Array.isArray(data) ? data : []);
        setLoadingCustomers(false);
      })
      .catch(err => {
        console.error('Failed to load customers:', err);
        setLoadingCustomers(false);
      });
  };

  useEffect(() => {
    let active = true;
    fetch('/api/customers')
      .then(r => r.json())
      .then(data => {
        if (active) {
          setCustomerList(Array.isArray(data) ? data : []);
          setLoadingCustomers(false);
        }
      })
      .catch(err => {
        console.error('Failed to load customers:', err);
        if (active) {
          setLoadingCustomers(false);
        }
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    fetch(`/api/inventory?${params}`).then(r => r.json()).then(data => {
      setMedicines(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, [search]);

  const addToCart = (med) => {
    if (med.quantity === 0) return;
    setCart(prev => {
      const existing = prev.find(c => c.medicine.id === med.id);
      if (existing) {
        if (existing.quantity >= med.quantity) return prev;
        return prev.map(c => c.medicine.id === med.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { medicine: med, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.medicine.id !== id));

  const updateQty = (id, qty) => {
    const med = medicines.find(m => m.id === id);
    if (!med || qty < 1 || qty > med.quantity) return;
    setCart(prev => prev.map(c => c.medicine.id === id ? { ...c, quantity: qty } : c));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.medicine.unit_price * c.quantity, 0);
  const itemCount  = cart.reduce((s, c) => s + c.quantity, 0);

  const handleCheckout = async () => {
    setError('');
    
    if (customerMode === 'new') {
      if (!customerName.trim() || !mobileNumber.trim()) {
        setError('Customer name and mobile number are required.');
        return;
      }
      if (!/^(\+91\d{10}|\d{10})$/.test(mobileNumber.trim())) {
        setError('Enter a 10-digit number or +91XXXXXXXXXX format.');
        return;
      }
    } else {
      if (!selectedCustomer) {
        setError('Please select an existing customer or switch to New Customer.');
        return;
      }
    }

    if (cart.length === 0) {
      setError('Add at least one medicine to the bill.');
      return;
    }
    
    setProcessing(true);
    const checkoutName = customerMode === 'new' ? customerName : selectedCustomer.name;
    const checkoutMobile = customerMode === 'new' ? mobileNumber : selectedCustomer.mobile_number;

    const res  = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: selectedCustomer?.id || null,
        customerName: checkoutName,
        mobileNumber: checkoutMobile,
        smsConsent,
        items: cart.map(c => ({ medicineId: c.medicine.id, quantity: c.quantity })),
      }),
    });
    const data = await res.json();
    setProcessing(false);

    if (!res.ok) { setError(data.error || 'Sale failed. Please try again.'); return; }

    /* Store receipt then reset */
    setLastReceipt({
      customerName: checkoutName,
      mobileNumber: checkoutMobile,
      items: [...cart],
      total: cartTotal,
      date: new Date(),
    });

    toast(`Sale recorded! ₹${cartTotal.toFixed(2)} received.`, 'success');
    setCart([]);
    setCustomerName('');
    setMobileNumber('');
    setSmsConsent(false);
    setSelectedCustomer(null);
    setCustomerSearch('');
    fetchCustomers();
    fetch('/api/inventory').then(r => r.json()).then(data => setMedicines(Array.isArray(data) ? data : []));
  };

  const printReceipt = () => {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Receipt</title><style>
      body{font-family:monospace;padding:24px;max-width:320px;margin:auto}
      h2{text-align:center;font-size:16px;margin-bottom:4px}
      p{text-align:center;font-size:12px;color:#666;margin:0 0 16px}
      hr{border:1px dashed #ccc;margin:10px 0}
      .row{display:flex;justify-content:space-between;font-size:13px;margin:4px 0}
      .total{font-weight:bold;font-size:15px}
    </style></head><body>
      <h2>MEDISTORE</h2>
      <p>${lastReceipt.date.toLocaleString('en-IN')}</p>
      <p>Customer: ${lastReceipt.customerName}<br/>${lastReceipt.mobileNumber}</p>
      <hr/>
      ${lastReceipt.items.map(c => `<div class="row"><span>${c.medicine.name} ×${c.quantity}</span><span>₹${(c.medicine.unit_price * c.quantity).toFixed(2)}</span></div>`).join('')}
      <hr/>
      <div class="row total"><span>TOTAL</span><span>₹${lastReceipt.total.toFixed(2)}</span></div>
      <p style="margin-top:16px">Thank you for your purchase!</p>
    </body></html>`);
    w.document.close();
    w.print();
  };

  const availableMeds = medicines.filter(m => m.quantity > 0);

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>New Sale</h1>
        <p className={styles.pageSubtitle}>Record a customer purchase and update inventory automatically.</p>
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: 20 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
          </svg>
          {error}
        </div>
      )}

      <div className={styles.posLayout}>
        {/* LEFT: Customer details + medicine picker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Customer Details */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                Customer Details
              </span>
            </div>
            <div style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('existing');
                    setSelectedCustomer(null);
                    setCustomerName('');
                    setMobileNumber('');
                    setSmsConsent(false);
                    setCustomerSearch('');
                  }}
                  className={`${styles.btnSm} ${customerMode === 'existing' ? styles.btnSmPrimary : styles.btnSmGhost}`}
                  style={{ flex: 1, justifyContent: 'center', padding: '8px' }}
                >
                  Existing Customer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('new');
                    setSelectedCustomer(null);
                    setCustomerName('');
                    setMobileNumber('');
                    setSmsConsent(false);
                    setCustomerSearch('');
                  }}
                  className={`${styles.btnSm} ${customerMode === 'new' ? styles.btnSmPrimary : styles.btnSmGhost}`}
                  style={{ flex: 1, justifyContent: 'center', padding: '8px' }}
                >
                  New Customer
                </button>
              </div>

              {customerMode === 'existing' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <label className="input-label">Search Customer *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder={loadingCustomers ? "Loading customers..." : "Search name or mobile..."}
                        value={customerSearch}
                        onChange={e => {
                          setCustomerSearch(e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        disabled={loadingCustomers}
                      />
                      {customerSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomerSearch('');
                            setSelectedCustomer(null);
                            setCustomerName('');
                            setMobileNumber('');
                            setSmsConsent(false);
                          }}
                          style={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                          }}
                        >
                          <CloseIcon />
                        </button>
                      )}
                    </div>

                    {showDropdown && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 100,
                          background: 'var(--surface)',
                          border: '1px solid var(--border-strong)',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-lg)',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          marginTop: 4
                        }}
                      >
                        {customerList.filter(c =>
                          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          c.mobile_number.includes(customerSearch)
                        ).length === 0 ? (
                          <div style={{ padding: '10px 14px', color: 'var(--text-faint)', fontSize: '0.875rem' }}>
                            No customers found. Switch to &quot;New Customer&quot; mode.
                          </div>
                        ) : (
                          customerList.filter(c =>
                            c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                            c.mobile_number.includes(customerSearch)
                          ).map(c => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setSelectedCustomer(c);
                                setCustomerName(c.name);
                                setMobileNumber(c.mobile_number);
                                setSmsConsent(c.sms_consent);
                                setCustomerSearch(`${c.name} (${c.mobile_number})`);
                                setShowDropdown(false);
                              }}
                              style={{
                                padding: '10px 14px',
                                cursor: 'pointer',
                                background: selectedCustomer?.id === c.id ? 'var(--accent-dim)' : 'transparent',
                                borderBottom: '1px solid var(--border)'
                              }}
                              onMouseEnter={e => {
                                if (selectedCustomer?.id !== c.id) {
                                  e.currentTarget.style.background = 'var(--surface-2)';
                                }
                              }}
                              onMouseLeave={e => {
                                if (selectedCustomer?.id !== c.id) {
                                  e.currentTarget.style.background = 'transparent';
                                }
                              }}
                            >
                              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>{c.name}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.mobile_number}</div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {selectedCustomer && (
                    <div
                      style={{
                        padding: '12px 14px',
                        background: 'var(--accent-dim)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--accent)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4
                      }}
                    >
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)' }}>
                        SELECTED CUSTOMER
                      </div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text)' }}>
                        {selectedCustomer.name}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {selectedCustomer.mobile_number}
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={smsConsent}
                          onChange={e => setSmsConsent(e.target.checked)}
                          style={{ width: 14, height: 14, accentColor: 'var(--accent)', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Consents to SMS expiry alerts
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className={styles.formGrid}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Customer Name *</label>
                      <input
                        id="customer-name"
                        className="input-field"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Mobile Number *</label>
                      <input
                        id="customer-mobile"
                        className="input-field"
                        value={mobileNumber}
                        onChange={e => {
                          const v = e.target.value.replace(/[^\d+]/g, '');
                          if (v === '' || v === '+' || v.startsWith('+91') || /^\d+$/.test(v)) setMobileNumber(v);
                        }}
                        placeholder="+919345581362 or 10-digit"
                        maxLength={13}
                      />
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, cursor: 'pointer' }}>
                    <input
                      id="sms-consent"
                      type="checkbox"
                      checked={smsConsent}
                      onChange={e => setSmsConsent(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Customer consents to receive SMS expiry alerts
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Medicine Picker */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                  <path d="m8.5 8.5 7 7"/>
                </svg>
                Select Medicines
              </span>
              <div className={styles.searchWrap} style={{ maxWidth: 200 }}>
                <span className={styles.searchIcon}><SearchIcon /></span>
                <input className={styles.searchInput} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>

            {loading ? (
              <table className={styles.table}>
                <thead><tr><th>Medicine</th><th>Category</th><th>Stock</th><th>Price</th><th>Add</th></tr></thead>
                <tbody><SkeletonMedRows /></tbody>
              </table>
            ) : availableMeds.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                    <path d="m8.5 8.5 7 7"/>
                  </svg>
                </div>
                <div className={styles.emptyStateTitle}>No medicines available</div>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr><th>Medicine</th><th>Category</th><th>Stock</th><th>Price</th><th>Add</th></tr>
                </thead>
                <tbody>
                  {availableMeds.map(med => {
                    const inCart = cart.find(c => c.medicine.id === med.id);
                    return (
                      <tr key={med.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{med.name}</div>
                          <code style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>{med.batch_number}</code>
                        </td>
                        <td>{med.category
                          ? <span className={`${styles.badge} ${styles.badgeAccent}`}>{med.category}</span>
                          : <span style={{ color: 'var(--text-faint)' }}>—</span>}
                        </td>
                        <td style={{ color: med.quantity < 10 ? 'var(--warning)' : 'var(--text)', fontWeight: 600 }}>{med.quantity}</td>
                        <td>₹{med.unit_price}</td>
                        <td>
                          <button
                            className={`${styles.btnSm} ${inCart ? styles.btnSmGhost : styles.btnSmPrimary}`}
                            onClick={() => addToCart(med)}
                          >
                            <PlusIcon /> {inCart ? `+1 (${inCart.quantity})` : 'Add'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT: Bill panel */}
        <div className={styles.billPanel}>
          <div className={styles.billTitle}>
            <CartIcon />
            Bill
            {itemCount > 0 && (
              <span className={`${styles.badge} ${styles.badgeAccent}`} style={{ marginLeft: 'auto' }}>
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-faint)', fontSize: '0.875rem' }}>
              <CartIcon />
              <div style={{ marginTop: 8 }}>Your bill is empty</div>
              <div style={{ fontSize: '0.78rem', marginTop: 4 }}>Add medicines from the table</div>
            </div>
          ) : (
            <>
              {cart.map(c => (
                <div key={c.medicine.id} className={styles.billItem}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={styles.billItemName} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.medicine.name}
                    </div>
                    <div className={styles.billItemSub}>₹{c.medicine.unit_price} each</div>
                  </div>
                  <div className={styles.billItemRight}>
                    <input
                      type="number"
                      min={1}
                      max={c.medicine.quantity}
                      value={c.quantity}
                      onChange={e => updateQty(c.medicine.id, parseInt(e.target.value))}
                      className={styles.qtyInput}
                    />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text)', fontWeight: 600, minWidth: 60, textAlign: 'right' }}>
                      ₹{(c.medicine.unit_price * c.quantity).toFixed(2)}
                    </span>
                    <button className={`${styles.btnSm} ${styles.btnSmDanger}`} onClick={() => removeFromCart(c.medicine.id)} style={{ padding: '5px 7px' }}>
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}

              <hr className={styles.billDivider} />
              <div className={styles.billTotal}>
                <span>Total</span>
                <span className={styles.billTotalAmount}>₹{cartTotal.toFixed(2)}</span>
              </div>
            </>
          )}

          <button
            id="checkout-btn"
            className="btn-primary"
            style={{ marginTop: 20 }}
            onClick={handleCheckout}
            disabled={processing || cart.length === 0}
          >
            {processing ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Processing…
              </>
            ) : 'Complete Sale'}
          </button>

          {/* Receipt preview after checkout */}
          {lastReceipt && (
            <div className={styles.receiptWrap} ref={receiptRef}>
              <div className={styles.receiptTitle}>MEDISTORE</div>
              <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-faint)', marginBottom: 8 }}>
                {lastReceipt.date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                {lastReceipt.customerName} · {lastReceipt.mobileNumber}
              </div>
              <div className={styles.receiptDivider} />
              {lastReceipt.items.map(c => (
                <div key={c.medicine.id} className={styles.receiptLine}>
                  <span>{c.medicine.name} ×{c.quantity}</span>
                  <span>₹{(c.medicine.unit_price * c.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className={styles.receiptDivider} />
              <div className={styles.receiptLine} style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>
                <span>TOTAL</span>
                <span>₹{lastReceipt.total.toFixed(2)}</span>
              </div>
              <button
                className={`${styles.btnSm} ${styles.btnSmGhost}`}
                onClick={printReceipt}
                style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
              >
                <PrintIcon /> Print Receipt
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

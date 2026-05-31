// InvoiceView.jsx — Clean bill/invoice page with image export
import { useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import './InvoiceView.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

function formatDateLong(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function InvoiceView({ profileId, store, onBack }) {
  const exportRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const { getProfile, getBalance } = store;
  const profile = getProfile(profileId);
  if (!profile) return null;

  const balance = getBalance(profileId);
  const sorted = [...profile.transactions].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // ── Share as image ─────────────────────────────────────────
  const handleShareImage = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const blob = await toBlob(exportRef.current, {
        pixelRatio: 3,
        backgroundColor: '#f5f5f3',
        style: { borderRadius: '0px' }, // toBlob needs flat edges to avoid clip
      });
      if (!blob) throw new Error('Failed to generate image');

      const file = new File([blob], `splittab-${profile.name.toLowerCase()}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `Split with ${profile.name}` });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `splittab-${profile.name.toLowerCase()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Could not export image: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'settled';
  const balanceLabel = balance > 0
    ? `💸 ${profile.name} owes you`
    : balance < 0
    ? `🙏 You owe ${profile.name}`
    : '✅ All settled up';

  return (
    <div className="page invoice-page">
      <div className="page-header">
        <button id="invoice-back-btn" className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <p className="label" style={{ marginTop: 20 }}>Invoice</p>
        <h1 className="heading-lg invoice-title">{profile.name.toUpperCase()}</h1>
        <p className="invoice-date">Generated {today}</p>
      </div>

      <div className="page-content">

        {/* ── Captured export card (this is what becomes the image) ── */}
        <div className="invoice-export-card" ref={exportRef}>
          {/* Header */}
          <div className="export-header">
            <div>
              <p className="export-brand">SPLITTAB</p>
              <h2 className="export-name">{profile.name.toUpperCase()}</h2>
              <p className="export-date">{today}</p>
            </div>
          </div>

          {/* Balance banner */}
          <div className={`export-banner export-banner--${balanceClass}`}>
            <p className="export-banner-label">{balanceLabel}</p>
            <p className="export-banner-amount">
              {balance === 0 ? '₹0' : formatCurrency(balance)}
            </p>
          </div>

          {/* Transactions */}
          <div className="export-table">
            <div className="export-table-head">
              <span>DATE</span>
              <span>NOTE</span>
              <span>AMOUNT</span>
            </div>
            <div className="export-divider" />
            {sorted.length === 0 ? (
              <p className="export-empty">No transactions yet</p>
            ) : (
              sorted.map((tx, i) => (
                <div key={tx.id}>
                  <div className="export-row">
                    <span className="export-row-date">{formatDate(tx.date)}</span>
                    <span className="export-row-note">
                      {tx.note || (tx.direction === 'i_paid' ? 'I paid' : 'They paid')}
                    </span>
                    <span className={`export-row-amount ${tx.direction === 'i_paid' ? 'amount-pos' : 'amount-neg'}`}>
                      {tx.direction === 'i_paid' ? '+' : '−'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                  {i < sorted.length - 1 && <div className="export-row-divider" />}
                </div>
              ))
            )}
            <div className="export-divider" />
            <div className="export-total-row">
              <span>NET TOTAL</span>
              <span className={balance >= 0 ? 'amount-pos' : 'amount-neg'}>
                {balance >= 0 ? '+' : '−'}{formatCurrency(balance)}
              </span>
            </div>
          </div>

          {/* Footer */}
          <p className="export-footer">splittab · split expenses, simply</p>
        </div>

        {/* ── Action buttons ── */}
        <div className="invoice-actions">
          <button
            id="share-image-btn"
            className="btn btn-primary btn-full"
            onClick={handleShareImage}
            disabled={exporting}
          >
            {exporting ? 'Generating...' : '🖼 Share as Image'}
          </button>
        </div>
      </div>
    </div>
  );
}



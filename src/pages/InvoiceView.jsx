// InvoiceView.jsx — Clean bill/invoice page
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
    year: 'numeric',
  });
}

export default function InvoiceView({ profileId, store, onBack }) {
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

  const summaryText = buildSummaryText(profile, sorted, balance);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Split with ${profile.name}`,
          text: summaryText,
        });
      } catch (_) {}
    } else {
      await navigator.clipboard.writeText(summaryText);
      alert('Invoice copied to clipboard!');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summaryText);
    alert('Copied to clipboard!');
  };

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
        {/* Summary Banner */}
        <div className={`invoice-banner ${balance > 0 ? 'banner-green' : balance < 0 ? 'banner-red' : 'banner-grey'}`}>
          <p className="invoice-banner-label">
            {balance > 0 ? '💸 They owe you' : balance < 0 ? '🙏 You owe them' : '✅ All settled'}
          </p>
          <p className="invoice-banner-amount">
            {balance === 0 ? '₹0' : formatCurrency(balance)}
          </p>
        </div>

        {/* Transaction Table */}
        <div className="card invoice-table-card">
          <div className="invoice-table-header">
            <span>DATE</span>
            <span>NOTE</span>
            <span>AMOUNT</span>
          </div>
          <div className="divider" />
          {sorted.length === 0 ? (
            <p style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
              No transactions
            </p>
          ) : (
            sorted.map((tx, i) => (
              <div key={tx.id}>
                <div className="invoice-row">
                  <span className="invoice-row-date">{formatDate(tx.date)}</span>
                  <span className="invoice-row-note">
                    {tx.note || (tx.direction === 'i_paid' ? 'I paid' : 'They paid')}
                    <span className={`invoice-tag ${tx.direction === 'i_paid' ? 'tag-green' : 'tag-red'}`}>
                      {tx.direction === 'i_paid' ? 'I paid' : 'They paid'}
                    </span>
                  </span>
                  <span className={`invoice-row-amount ${tx.direction === 'i_paid' ? 'amount-green' : 'amount-red'}`}>
                    {tx.direction === 'i_paid' ? '+' : '−'}{formatCurrency(tx.amount)}
                  </span>
                </div>
                {i < sorted.length - 1 && <div className="divider" />}
              </div>
            ))
          )}
          <div className="divider" />
          <div className="invoice-total-row">
            <span>NET TOTAL</span>
            <span className={balance >= 0 ? 'amount-green' : 'amount-red'}>
              {balance >= 0 ? '+' : '−'}{formatCurrency(balance)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="invoice-actions">
          <button id="share-invoice-btn" className="btn btn-primary btn-full" onClick={handleShare}>
            ↑ Share Invoice
          </button>
          <button id="copy-invoice-btn" className="btn btn-ghost btn-full" onClick={handleCopy}>
            Copy as Text
          </button>
        </div>
      </div>
    </div>
  );
}

function buildSummaryText(profile, transactions, balance) {
  const lines = [
    `============================`,
    `  SPLITTAB INVOICE`,
    `============================`,
    `Friend: ${profile.name}`,
    `Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    ``,
    `TRANSACTIONS`,
    `----------------------------`,
  ];

  transactions.forEach(tx => {
    const dir = tx.direction === 'i_paid' ? 'I paid  ' : 'They paid';
    const note = tx.note ? ` — ${tx.note}` : '';
    lines.push(`${tx.date}  ${dir}  ₹${tx.amount.toFixed(2)}${note}`);
  });

  lines.push(`----------------------------`);

  if (balance > 0) {
    lines.push(`NET: ${profile.name} owes you ₹${Math.abs(balance).toFixed(2)}`);
  } else if (balance < 0) {
    lines.push(`NET: You owe ${profile.name} ₹${Math.abs(balance).toFixed(2)}`);
  } else {
    lines.push(`NET: All settled up! ✓`);
  }

  lines.push(`============================`);
  return lines.join('\n');
}

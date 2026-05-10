import React, { useState } from 'react';

const noiseDataUrl = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`;

const glassStyle = {
  position: 'relative',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 60%, rgba(180,200,255,0.07) 100%)',
  backdropFilter: 'blur(28px) saturate(180%)',
  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: `
    0 0 0 0.5px rgba(255,255,255,0.08) inset,
    0 1.5px 0 0 rgba(255,255,255,0.22) inset,
    0 -1px 0 0 rgba(0,0,0,0.15) inset,
    1px 0 0 0 rgba(255,255,255,0.1) inset,
    -1px 0 0 0 rgba(255,255,255,0.05) inset,
    0 8px 32px rgba(0,0,0,0.35),
    0 2px 8px rgba(0,0,0,0.2)
  `,
};

const specularOverlayStyle = {
  position: 'absolute',
  inset: 0,
  borderRadius: 'inherit',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 40%, transparent 65%)',
  pointerEvents: 'none',
  zIndex: 1,
};

const noiseOverlayStyle = {
  position: 'absolute',
  inset: 0,
  borderRadius: 'inherit',
  backgroundImage: noiseDataUrl,
  backgroundSize: '200px 200px',
  opacity: 0.4,
  mixBlendMode: 'overlay',
  pointerEvents: 'none',
  zIndex: 2,
};

const rimGlowStyle = {
  position: 'absolute',
  top: -1,
  left: '10%',
  right: '10%',
  height: 1,
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7) 30%, rgba(180,220,255,0.9) 50%, rgba(255,255,255,0.7) 70%, transparent)',
  borderRadius: '50%',
  filter: 'blur(0.5px)',
  pointerEvents: 'none',
  zIndex: 3,
};

function GlassCard({ children, style = {}, className = '' }) {
  return (
    <div style={{ ...glassStyle, borderRadius: 28, ...style }} className={className}>
      <div style={rimGlowStyle} />
      <div style={specularOverlayStyle} />
      <div style={noiseOverlayStyle} />
      <div style={{ position: 'relative', zIndex: 4 }}>
        {children}
      </div>
    </div>
  );
}

function TypeBadge({ label }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.04em',
      background: 'linear-gradient(135deg, rgba(99,179,255,0.18), rgba(120,100,255,0.12))',
      border: '0.5px solid rgba(130,190,255,0.3)',
      color: 'rgba(160,210,255,0.95)',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset',
    }}>
      {label || 'Unknown'}
    </span>
  );
}

export default function App() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  };

  const analyzeQuote = async () => {
    if (!file) return alert('Please select an image first');
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('https://invoiceanalyzerbackend.onrender.com/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Server connection failed. Is Render awake?');
    } finally {
      setLoading(false);
    }
  };

  // --- NEW MATH LOGIC ---
  // Safely extract the tax number (handles "18%" or just 18)
  const getTaxRate = (taxVal) => {
    if (!taxVal) return 0;
    const num = parseFloat(taxVal.toString().replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  // Calculate Base Amount + Tax
  const getItemTotalWithTax = (item) => {
    const baseAmount = parseFloat(item.amount) || 0;
    const taxRate = getTaxRate(item.tax_percentage);
    return baseAmount + (baseAmount * (taxRate / 100));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(30,60,140,0.55) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 80% 80%, rgba(80,30,160,0.45) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 50% 50%, rgba(10,20,60,1) 0%, #050814 100%)',
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      color: 'white',
      padding: '60px 24px 80px',
      boxSizing: 'border-box',
    }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: 'rgba(50,100,255,0.15)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '45%', height: '45%', borderRadius: '50%', background: 'rgba(120,60,220,0.15)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '30%', width: '40%', height: '30%', borderRadius: '50%', background: 'rgba(20,80,180,0.08)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ maxWidth: 950, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-block',
            marginBottom: 16,
            padding: '6px 18px',
            borderRadius: 999,
            background: 'linear-gradient(90deg, rgba(80,140,255,0.15), rgba(120,80,255,0.15))',
            border: '0.5px solid rgba(120,180,255,0.25)',
            fontSize: 12,
            letterSpacing: '0.15em',
            fontWeight: 600,
            color: 'rgba(160,200,255,0.8)',
            textTransform: 'uppercase',
          }}>
            AI-Powered
          </div>
          <h1 style={{
            fontSize: 52,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            margin: '0 0 12px',
            background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(180,200,255,0.7) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Invoice Analyzer
          </h1>
          <p style={{ color: 'rgba(180,190,220,0.7)', fontSize: 16, maxWidth: 440, margin: '0 auto', lineHeight: 1.6 }}>
            Upload a handwritten or printed invoice for a clear, categorized breakdown.
          </p>
        </header>

        {/* Upload Card */}
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <GlassCard style={{ padding: 36 }}>
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 140,
                borderRadius: 16,
                border: `1.5px dashed ${dragOver ? 'rgba(100,170,255,0.6)' : 'rgba(255,255,255,0.12)'}`,
                background: dragOver ? 'rgba(80,140,255,0.08)' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12, marginBottom: 12,
                background: 'linear-gradient(135deg, rgba(100,160,255,0.2), rgba(120,80,255,0.15))',
                border: '0.5px solid rgba(140,180,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 0 rgba(255,255,255,0.15) inset',
              }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="rgba(160,210,255,0.8)" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(200,215,255,0.8)', margin: 0 }}>
                <span style={{ color: 'rgba(120,190,255,1)', fontWeight: 600 }}>Click to upload</span> or drag and drop
              </p>
              <p style={{ fontSize: 12, color: 'rgba(150,160,200,0.5)', margin: '6px 0 0' }}>
                {file ? file.name : 'PNG, JPG or JPEG'}
              </p>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </label>

            <button
              onClick={analyzeQuote}
              disabled={loading}
              style={{
                marginTop: 24,
                width: '100%',
                padding: '14px 32px',
                borderRadius: 14,
                border: '0.5px solid rgba(255,255,255,0.2)',
                background: loading
                  ? 'rgba(60,100,200,0.3)'
                  : 'linear-gradient(135deg, rgba(70,130,255,0.55) 0%, rgba(100,60,220,0.45) 100%)',
                backdropFilter: 'blur(12px)',
                color: 'white',
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: '0.01em',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: loading ? 'none' : `
                  0 1px 0 rgba(255,255,255,0.25) inset,
                  0 -1px 0 rgba(0,0,0,0.2) inset,
                  0 4px 20px rgba(60,100,255,0.3),
                  0 1px 4px rgba(0,0,0,0.3)
                `,
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={{
                    display: 'inline-block', width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.25)', borderTopColor: 'white',
                    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                  }} />
                  Processing…
                </span>
              ) : 'Analyze Invoice'}
            </button>
          </GlassCard>
        </div>

        {/* Results */}
        {results?.items?.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                padding: '16px 24px',
                borderBottom: '0.5px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(160,200,255,0.7)', textTransform: 'uppercase' }}>
                  Results · {results.items.length} items
                </span>
                {results.paid_to && (
                  <span style={{ fontSize: 13, color: 'rgba(180,190,220,0.6)' }}>
                    {results.paid_to}
                  </span>
                )}
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 850 }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      {['Item', 'Type', 'Sub-Type', 'Tax %', 'Qty', 'Unit Price', 'Total (w/ Tax)'].map((h, i) => (
                        <th key={h} style={{
                          padding: '12px 20px',
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          color: 'rgba(140,170,220,0.6)',
                          textTransform: 'uppercase',
                          textAlign: i >= 3 ? 'right' : 'left', 
                          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.items.map((item, i) => (
                      <tr key={i} style={{
                        borderBottom: '0.5px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 20px', fontSize: 14, color: 'rgba(220,230,255,0.9)', fontWeight: 500 }}>
                          {item.description}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <TypeBadge label={item.type} />
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 13, color: 'rgba(180,200,240,0.7)' }}>
                          {item.sub_type || '-'}
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: 13, color: 'rgba(180,200,240,0.7)' }}>
                          {item.tax_percentage ? `${getTaxRate(item.tax_percentage)}%` : '-'}
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 700, color: 'rgba(120,190,255,0.9)', fontSize: 14 }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', color: 'rgba(160,170,210,0.6)', fontSize: 13 }}>
                          ₹{item.unit_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 700, color: 'rgba(240,245,255,0.95)', fontSize: 14 }}>
                          {/* USING THE NEW MATH HERE */}
                          ₹{getItemTotalWithTax(item).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer total */}
              <div style={{
                padding: '14px 24px',
                borderTop: '0.5px solid rgba(255,255,255,0.08)',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 16,
                background: 'rgba(255,255,255,0.02)',
              }}>
                <span style={{ fontSize: 13, color: 'rgba(150,160,200,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Grand Total (Inc. Tax)</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>
                  {/* USING THE NEW MATH FOR THE SUM */}
                  ₹{results.items.reduce((sum, item) => sum + getItemTotalWithTax(item), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </GlassCard>

            {results.gstin_numbers?.length > 0 && (
              <p style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: 'rgba(130,145,180,0.5)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                GSTIN: {results.gstin_numbers.join(' · ')}
              </p>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
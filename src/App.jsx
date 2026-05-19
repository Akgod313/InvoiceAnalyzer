import React, { useState, Component } from 'react';

const noiseDataUrl = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`;

const glassStyle = {
  position: 'relative', background: 'linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 60%, rgba(180,200,255,0.07) 100%)',
  backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: `0 0 0 0.5px rgba(255,255,255,0.08) inset, 0 1.5px 0 0 rgba(255,255,255,0.22) inset, 0 -1px 0 0 rgba(0,0,0,0.15) inset, 1px 0 0 0 rgba(255,255,255,0.1) inset, -1px 0 0 0 rgba(255,255,255,0.05) inset, 0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)`,
};

const inputStyle = { width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white', padding: '6px 10px', fontSize: '13px', outline: 'none', fontFamily: 'inherit' };
const actionBtnStyle = { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' };

// --- SAFETY UTILITIES ---
const getSafeVal = (val) => (val !== undefined && val !== null ? String(val) : '');
const parseNum = (val) => {
  if (!val) return 0;
  const num = parseFloat(String(val).replace(/,/g, ''));
  return isNaN(num) ? 0 : num;
};

// --- ERROR BOUNDARY ---
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, info: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { this.setState({ info }); console.error("Caught by ErrorBoundary:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: 'white', background: '#111', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#ff6b6b' }}>⚠️ React Crashed!</h2>
          <p>Please share this exact error so we can fix it:</p>
          <pre style={{ background: 'rgba(255,0,0,0.1)', padding: 20, borderRadius: 8, whiteSpace: 'pre-wrap', fontSize: 13, border: '1px solid rgba(255,0,0,0.3)' }}>
            <strong>{this.state.error && this.state.error.toString()}</strong><br/><br/>
            {this.state.info && this.state.info.componentStack}
          </pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', marginTop: 20, cursor: 'pointer', borderRadius: 8, border: 'none', background: 'white', color: 'black', fontWeight: 'bold' }}>Reload App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- UI COMPONENTS ---
function GlassCard({ children, style = {}, className = '' }) {
  return (
    <div style={{ ...glassStyle, borderRadius: 28, ...style }} className={className}>
      <div style={{ position: 'absolute', top: -1, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7) 30%, rgba(180,220,255,0.9) 50%, rgba(255,255,255,0.7) 70%, transparent)', borderRadius: '50%', filter: 'blur(0.5px)', pointerEvents: 'none', zIndex: 3 }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 40%, transparent 65%)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', backgroundImage: noiseDataUrl, backgroundSize: '200px 200px', opacity: 0.4, mixBlendMode: 'overlay', pointerEvents: 'none', zIndex: 2 }} />
      <div style={{ position: 'relative', zIndex: 4 }}>{children}</div>
    </div>
  );
}

function TypeBadge({ label }) {
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', background: 'linear-gradient(135deg, rgba(99,179,255,0.18), rgba(120,100,255,0.12))', border: '0.5px solid rgba(130,190,255,0.3)', color: 'rgba(160,210,255,0.95)' }}>
      {label || 'Unknown'}
    </span>
  );
}

// --- MAIN APP COMPONENT ---
function MainApp() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const [editingIndex, setEditingIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingDb, setSavingDb] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [globalProject, setGlobalProject] = useState('');

  // 🔥 THE FIX: This ensures `items` is ALWAYS a valid array, never null.
  const safeItems = Array.isArray(results?.items) ? results.items : [];

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); };

  const analyzeQuote = async () => {
    if (!file) return alert('Please select an image first');
    setLoading(true); setSaveMessage('');
    const formData = new FormData(); formData.append('file', file);
    try {
      const response = await fetch('https://invoiceanalyzerbackend.onrender.com/analyze', { method: 'POST', body: formData });
      const data = await response.json();
      if (data) setResults(data); else alert("Empty response from server.");
    } catch (error) {
      alert('Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadToDatabase = async () => {
    if (!results || safeItems.length === 0) return;
    setSavingDb(true); setSaveMessage('');
    try {
      const response = await fetch('https://invoiceanalyzerbackend.onrender.com/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(results) });
      const data = await response.json();
      setSaveMessage(data.status === 'Success' ? '✅ Successfully saved to Neon!' : '❌ ' + data.status);
    } catch (error) {
      setSaveMessage('❌ Connection failed');
    } finally { setSavingDb(false); }
  };

  const getItemTotalWithTax = (item) => {
    const base = parseNum(item?.amount);
    const cgst = parseNum(item?.cgst_amount);
    const sgst = parseNum(item?.sgst_amount);
    const igst = parseNum(item?.igst_amount);
    return base + cgst + sgst + igst;
  };

  const handleEditClick = (index, item) => { setEditingIndex(index); setEditFormData({ ...item }); };
  const handleEditChange = (field, value) => { setEditFormData({ ...editFormData, [field]: value }); };

  const handleCancelEdit = () => { setEditingIndex(null); setEditFormData({}); };

  const handleSaveEdit = () => {
    if (!results) return;
    const newItems = [...safeItems];
    const updatedItem = { ...editFormData };
    
    // Safety Parsing: Convert inputs to raw numbers cleanly
    updatedItem.quantity = parseNum(updatedItem.quantity) || 1;
    updatedItem.amount = parseNum(updatedItem.amount);
    updatedItem.unit_price = updatedItem.quantity > 0 ? (updatedItem.amount / updatedItem.quantity) : updatedItem.amount;
    
    updatedItem.tax_percentage = parseNum(updatedItem.tax_percentage);
    updatedItem.cgst_amount = parseNum(updatedItem.cgst_amount);
    updatedItem.sgst_amount = parseNum(updatedItem.sgst_amount);
    updatedItem.igst_amount = parseNum(updatedItem.igst_amount);

    newItems[editingIndex] = updatedItem;
    setResults({ ...results, items: newItems });
    setEditingIndex(null); 
  };

  const applyProjectToAll = () => {
    if (!results) return;
    const updatedItems = safeItems.map(item => ({ ...item, project: globalProject }));
    setResults({ ...results, items: updatedItems });
    setGlobalProject(''); 
  };

  const getHeaderProjectDisplay = () => {
    if (safeItems.length === 0) return 'Unassigned';
    const validProjects = safeItems
      .map(item => item.project ? String(item.project).trim() : '')
      .filter(p => p !== '' && p !== '-' && p !== 'Unassigned');
      
    if (validProjects.length === 0) return 'Unassigned';
    const uniqueProjects = [...new Set(validProjects)];
    return uniqueProjects.length === 1 ? uniqueProjects[0] : 'Mixed';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(30,60,140,0.55) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 80% 80%, rgba(80,30,160,0.45) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 50% 50%, rgba(10,20,60,1) 0%, #050814 100%)', fontFamily: "'SF Pro Display', -apple-system, sans-serif", color: 'white', padding: '60px 24px 80px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        <header style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', marginBottom: 16, padding: '6px 18px', borderRadius: 999, background: 'linear-gradient(90deg, rgba(80,140,255,0.15), rgba(120,80,255,0.15))', border: '0.5px solid rgba(120,180,255,0.25)', fontSize: 12, letterSpacing: '0.15em', fontWeight: 600, color: 'rgba(160,200,255,0.8)' }}>
            TheHouseKraft
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 12px', background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(180,200,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Invoice Analyzer
          </h1>
        </header>

        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <GlassCard style={{ padding: 36 }}>
            <label onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 140, borderRadius: 16, border: `1.5px dashed ${dragOver ? 'rgba(100,170,255,0.6)' : 'rgba(255,255,255,0.12)'}`, background: dragOver ? 'rgba(80,140,255,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
              <p style={{ fontSize: 14, color: 'rgba(200,215,255,0.8)', margin: 0 }}>
                <span style={{ color: 'rgba(120,190,255,1)', fontWeight: 600 }}>Click to upload</span> or drag and drop
              </p>
              <p style={{ fontSize: 12, color: 'rgba(150,160,200,0.5)', margin: '6px 0 0' }}>{file ? file.name : 'PNG, JPG or JPEG'}</p>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) setFile(e.target.files[0]); }} />
            </label>
            <button onClick={analyzeQuote} disabled={loading} style={{ marginTop: 24, width: '100%', padding: '14px 32px', borderRadius: 14, border: '0.5px solid rgba(255,255,255,0.2)', background: loading ? 'rgba(60,100,200,0.3)' : 'linear-gradient(135deg, rgba(70,130,255,0.55) 0%, rgba(100,60,220,0.45) 100%)', color: 'white', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Processing...' : 'Analyze Invoice'}
            </button>
          </GlassCard>
        </div>

        {safeItems.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
              
              <div style={{ padding: '16px 24px', borderBottom: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(160,200,255,0.9)', textTransform: 'uppercase' }}>
                    {results.vendor_name || 'Vendor Details'} · {safeItems.length} items
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(140,160,200,0.7)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    INV NO: <span style={{color: 'white'}}>{results.invoice_no || 'N/A'}</span> &nbsp;|&nbsp; DATE: <span style={{color: 'white'}}>{results.invoice_date || 'N/A'}</span> &nbsp;|&nbsp; TYPE: <span style={{color: 'white'}}>{results.voucher_type || 'N/A'}</span>
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(140,160,200,0.5)', fontFamily: 'monospace' }}>
                    PROJECT: <span style={{color: getHeaderProjectDisplay() === 'Mixed' ? 'rgba(255,200,100,0.9)' : 'rgba(120,200,120,0.9)', fontWeight: 'bold'}}>{getHeaderProjectDisplay()}</span> &nbsp;|&nbsp; PoS: {results.place_of_supply || 'N/A'}
                  </span>
                </div>
                <span style={{ fontSize: 13, color: 'rgba(180,190,220,0.9)', textAlign: 'right' }}>
                  <span style={{ color: 'rgba(130,150,200,0.6)', marginRight: 6 }}>BILLED TO:</span>{results.paid_to || "Not Found"}
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1550 }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      {['Item', 'Project', 'HSN/SAC', 'Type', 'Sub-Type', 'UOM', 'Qty', 'Unit Price', 'Base Val', 'Tax %', 'CGST', 'SGST', 'IGST', 'Total', 'Actions'].map((h, i) => (
                        <th key={h} style={{ padding: '12px 12px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(140,170,220,0.6)', textTransform: 'uppercase', textAlign: (i >= 6 && i <= 13) ? 'right' : (i === 14 ? 'center' : 'left'), borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safeItems.map((item, i) => {
                      const isEditing = editingIndex === i;
                      return (
                        <tr key={i} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)', background: isEditing ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                          <td style={{ padding: '12px', fontSize: 13, color: 'rgba(220,230,255,0.9)', fontWeight: 500, minWidth: '160px' }}>
                            {isEditing ? <input style={inputStyle} value={getSafeVal(editFormData.description)} onChange={(e) => handleEditChange('description', e.target.value)} /> : item.description}
                          </td>
                          <td style={{ padding: '12px', fontSize: 12, color: 'rgba(120,200,120,0.8)', minWidth: '110px' }}>
                            {isEditing ? <input style={inputStyle} placeholder="Project Name" value={getSafeVal(editFormData.project)} onChange={(e) => handleEditChange('project', e.target.value)} /> : (item.project || '-')}
                          </td>
                          <td style={{ padding: '12px', fontSize: 12, color: 'rgba(180,200,240,0.8)', fontFamily: 'monospace' }}>
                            {isEditing ? <input style={inputStyle} value={getSafeVal(editFormData.hsn_sac)} onChange={(e) => handleEditChange('hsn_sac', e.target.value)} /> : (item.hsn_sac || '-')}
                          </td>
                          <td style={{ padding: '12px', minWidth: '100px' }}>
                            {isEditing ? <input style={inputStyle} value={getSafeVal(editFormData.type)} onChange={(e) => handleEditChange('type', e.target.value)} /> : <TypeBadge label={item.type} />}
                          </td>
                          <td style={{ padding: '12px', fontSize: 12, color: 'rgba(180,200,240,0.7)', minWidth: '100px' }}>
                            {isEditing ? <input style={inputStyle} value={getSafeVal(editFormData.sub_type)} onChange={(e) => handleEditChange('sub_type', e.target.value)} /> : (item.sub_type || '-')}
                          </td>
                          <td style={{ padding: '12px', fontSize: 12, color: 'rgba(180,200,240,0.7)', width: '50px' }}>
                            {isEditing ? <input style={inputStyle} value={getSafeVal(editFormData.uom)} onChange={(e) => handleEditChange('uom', e.target.value)} /> : (item.uom || '-')}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'rgba(120,190,255,0.9)', fontSize: 13, width: '60px' }}>
                            {isEditing ? <input style={{...inputStyle, textAlign: 'right'}} value={getSafeVal(editFormData.quantity)} onChange={(e) => handleEditChange('quantity', e.target.value)} /> : item.quantity}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', color: 'rgba(160,170,210,0.6)', fontSize: 12 }}>
                            {isEditing ? <span style={{fontSize:10, color:'gray'}}>Auto</span> : `₹${parseNum(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: 'rgba(200,210,240,0.85)', fontSize: 13 }}>
                            {isEditing ? <input style={{...inputStyle, textAlign: 'right'}} value={getSafeVal(editFormData.amount)} onChange={(e) => handleEditChange('amount', e.target.value)} /> : `₹${parseNum(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontSize: 12, color: 'rgba(180,200,240,0.7)', width: '50px' }}>
                            {isEditing ? <input style={{...inputStyle, textAlign: 'right'}} value={getSafeVal(editFormData.tax_percentage)} onChange={(e) => handleEditChange('tax_percentage', e.target.value)} /> : (item.tax_percentage ? `${item.tax_percentage}%` : '-')}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontSize: 12, color: 'rgba(200,100,100,0.8)' }}>
                            {isEditing ? <input style={{...inputStyle, textAlign: 'right'}} value={getSafeVal(editFormData.cgst_amount)} onChange={(e) => handleEditChange('cgst_amount', e.target.value)} /> : (item.cgst_amount ? `${parseNum(item.tax_percentage) / 2}%` : '-')}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontSize: 12, color: 'rgba(100,200,100,0.8)' }}>
                            {isEditing ? <input style={{...inputStyle, textAlign: 'right'}} value={getSafeVal(editFormData.sgst_amount)} onChange={(e) => handleEditChange('sgst_amount', e.target.value)} /> : (item.sgst_amount ? `${parseNum(item.tax_percentage) / 2}%` : '-')}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontSize: 12, color: 'rgba(100,150,255,0.8)' }}>
                            {isEditing ? <input style={{...inputStyle, textAlign: 'right'}} value={getSafeVal(editFormData.igst_amount)} onChange={(e) => handleEditChange('igst_amount', e.target.value)} /> : (item.igst_amount ? `${parseNum(item.tax_percentage)}%` : '-')}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'rgba(240,245,255,0.95)', fontSize: 13 }}>
                            {isEditing ? <span style={{fontSize:10, color:'gray'}}>Auto</span> : `₹${getItemTotalWithTax(item).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', minWidth: '100px' }}>
                            {isEditing ? (
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                <button style={{...actionBtnStyle, background: 'rgba(80, 200, 120, 0.2)', borderColor: 'rgba(80, 200, 120, 0.5)'}} onClick={handleSaveEdit}>Save</button>
                                <button style={{...actionBtnStyle, background: 'rgba(255, 100, 100, 0.2)', borderColor: 'rgba(255, 100, 100, 0.5)'}} onClick={handleCancelEdit}>X</button>
                              </div>
                            ) : (
                              <button style={actionBtnStyle} onClick={() => handleEditClick(i, item)}>Edit</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* UPGRADED FOOTER: Bulk Project Assigner on Left, Totals on Right */}
              <div style={{ padding: '20px 24px', borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', background: 'rgba(255,255,255,0.015)' }}>
                
                {/* Left Side: Bulk Assign Project */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 4 }}>
                  <label style={{ fontSize: 12, color: 'rgba(150,160,200,0.6)', letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }}>
                    Bulk Assign Project
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      style={{ ...inputStyle, width: '220px', padding: '10px 14px', fontSize: 14, background: 'rgba(0,0,0,0.3)' }}
                      placeholder="e.g., Villa 44..."
                      value={globalProject}
                      onChange={(e) => setGlobalProject(e.target.value)}
                    />
                    <button
                      onClick={applyProjectToAll}
                      style={{...actionBtnStyle, padding: '0 16px', borderRadius: '6px', background: 'rgba(100, 160, 255, 0.2)', borderColor: 'rgba(100, 160, 255, 0.4)'}}
                    >
                      Apply to All
                    </button>
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(120,140,180,0.5)' }}>
                    *This will override the project name for every item above.
                  </span>
                </div>

                {/* Right Side: Totals */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '320px' }}>
                    <span style={{ fontSize: 13, color: 'rgba(150,160,200,0.6)', letterSpacing: '0.05em' }}>Total Base Amount:</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'rgba(200,210,240,0.85)' }}>
                      ₹{safeItems.reduce((sum, item) => sum + parseNum(item.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '320px' }}>
                    <span style={{ fontSize: 13, color: 'rgba(150,160,200,0.6)', letterSpacing: '0.05em' }}>Total Tax:</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(180,200,240,0.7)' }}>
                      ₹{(safeItems.reduce((sum, item) => sum + getItemTotalWithTax(item), 0) - safeItems.reduce((sum, item) => sum + parseNum(item.amount), 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '320px', marginTop: 8, paddingTop: 16, borderTop: '1px dashed rgba(255,255,255,0.15)' }}>
                    <span style={{ fontSize: 15, color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Grand Total:</span>
                    <span style={{ fontSize: 24, fontWeight: 800, color: 'white' }}>
                      ₹{safeItems.reduce((sum, item) => sum + getItemTotalWithTax(item), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 24, gap: 16 }}>
              {saveMessage && <span style={{ fontSize: 13, color: saveMessage.includes('✅') ? 'rgba(80, 220, 120, 0.9)' : 'rgba(255, 100, 100, 0.9)', fontWeight: 600 }}>{saveMessage}</span>}
              <button onClick={handleUploadToDatabase} disabled={savingDb} style={{ padding: '12px 28px', borderRadius: 12, border: '0.5px solid rgba(80, 200, 120, 0.4)', background: savingDb ? 'rgba(80, 200, 120, 0.1)' : 'linear-gradient(135deg, rgba(60, 180, 100, 0.2) 0%, rgba(40, 140, 80, 0.1) 100%)', color: savingDb ? 'rgba(255,255,255,0.5)' : 'white', fontWeight: 700, fontSize: 14, cursor: savingDb ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(40, 160, 80, 0.15)' }}>
                {savingDb ? 'Uploading...' : 'Upload to Database'}
              </button>
            </div>
            
            {Array.isArray(results.gstin_numbers) && results.gstin_numbers.length > 0 && (
              <p style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: 'rgba(130,145,180,0.5)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                GSTIN: {results.gstin_numbers.join(' · ')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
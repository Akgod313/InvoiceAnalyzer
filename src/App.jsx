import React, { useState, Component, useRef, useEffect } from 'react';

const noiseDataUrl = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`;

const glassStyle = {
  position: 'relative',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 60%, rgba(180,200,255,0.07) 100%)',
  backdropFilter: 'blur(28px) saturate(180%)',
  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: `0 0 0 0.5px rgba(255,255,255,0.08) inset, 0 1.5px 0 0 rgba(255,255,255,0.22) inset, 0 -1px 0 0 rgba(0,0,0,0.15) inset, 1px 0 0 0 rgba(255,255,255,0.1) inset, -1px 0 0 0 rgba(255,255,255,0.05) inset, 0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)`,
};

const inputStyle = {
  width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '6px', color: 'white', padding: '6px 10px', fontSize: '13px',
  outline: 'none', fontFamily: 'inherit',
};
const actionBtnStyle = {
  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
  color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
  fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em',
};

// --- SAFETY UTILITIES ---
const getSafeVal = (val) => (val !== undefined && val !== null ? String(val) : '');
const parseNum = (val) => {
  if (!val) return 0;
  const num = parseFloat(String(val).replace(/,/g, ''));
  return isNaN(num) ? 0 : num;
};
const fmt = (val) => parseNum(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPct = (val) => parseNum(val) > 0 ? `${parseNum(val)}%` : '-';

// --- ERROR BOUNDARY ---
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, info: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { this.setState({ info }); console.error('Caught by ErrorBoundary:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: 'white', background: '#111', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#ff6b6b' }}>⚠️ React Crashed!</h2>
          <p>Please share this exact error so we can fix it:</p>
          <pre style={{ background: 'rgba(255,0,0,0.1)', padding: 20, borderRadius: 8, whiteSpace: 'pre-wrap', fontSize: 13, border: '1px solid rgba(255,0,0,0.3)' }}>
            <strong>{this.state.error && this.state.error.toString()}</strong><br /><br />
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
function GlassCard({ children, style = {} }) {
  return (
    <div style={{ ...glassStyle, borderRadius: 28, ...style }}>
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

function Pill({ label, color = 'rgba(180,200,240,0.7)' }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, border: `0.5px solid ${color}`, color, letterSpacing: '0.04em' }}>
      {label}
    </span>
  );
}

// Column groups for the table header
const COL_GROUPS = [
  { label: 'DOCUMENT', span: 4, color: 'rgba(100,160,255,0.5)' },
  { label: 'SUPPLIER', span: 2, color: 'rgba(180,120,255,0.5)' },
  { label: 'ITEM / LINE', span: 9, color: 'rgba(80,200,160,0.5)' },
  { label: 'TAX', span: 7, color: 'rgba(255,160,80,0.5)' },
  { label: 'LEDGER', span: 3, color: 'rgba(200,200,100,0.5)' },
  { label: '', span: 1, color: 'transparent' },
];

const COLS = [
  // DOCUMENT
  { key: 'invoice_date',    label: 'Inv Date',     align: 'left',  minW: 90  },
  { key: 'invoice_no',      label: 'Inv No',       align: 'left',  minW: 100, mono: true },
  { key: 'voucher_type',    label: 'Type',         align: 'left',  minW: 80  },
  { key: 'po_number',       label: 'PO No',        align: 'left',  minW: 80, mono: true },
  // SUPPLIER
  { key: 'vendor_name',     label: 'Vendor',       align: 'left',  minW: 130 },
  { key: 'place_of_supply', label: 'State',        align: 'left',  minW: 80  },
  // ITEM / LINE
  { key: 'description',     label: 'Item',         align: 'left',  minW: 170 },
  { key: 'project',         label: 'Project',      align: 'left',  minW: 110 },
  { key: 'hsn_sac',         label: 'HSN/SAC',      align: 'left',  minW: 80, mono: true },
  { key: 'type',            label: 'Type',         align: 'left',  minW: 100 },
  { key: 'sub_type',        label: 'Sub-Type',     align: 'left',  minW: 100 },
  { key: 'uom',             label: 'UOM',          align: 'left',  minW: 50  },
  { key: 'quantity',        label: 'Qty',          align: 'right', minW: 55  },
  { key: 'unit_price',      label: 'Unit Price',   align: 'right', minW: 90  },
  { key: 'amount',          label: 'Base Amt',     align: 'right', minW: 90  },
  // TAX
  { key: 'discount_pct',       label: 'Disc %',    align: 'right', minW: 55  },
  { key: 'base_taxable_value', label: 'Taxable',   align: 'right', minW: 90  },
  { key: 'intra_or_inter',     label: 'Intra/Inter', align: 'center', minW: 70 },
  { key: 'cgst_amount',     label: 'CGST %',       align: 'right', minW: 60  },
  { key: 'sgst_amount',     label: 'SGST %',       align: 'right', minW: 60  },
  { key: 'igst_amount',     label: 'IGST %',       align: 'right', minW: 60  },
  { key: 'total_gst',       label: 'Total GST ₹',  align: 'right', minW: 90  },
  // LEDGER
  { key: 'ledger_account',  label: 'Ledger Acct',  align: 'left',  minW: 130 },
  { key: 'itc_eligible',    label: 'ITC',          align: 'center',minW: 50  },
  { key: 'nature_of_expense', label: 'Nature',     align: 'left',  minW: 120 },
  // ACTIONS
  { key: '_actions',        label: 'Actions',      align: 'center',minW: 100 },
];

// Fields that show as ₹ values
const RUPEE_FIELDS = new Set(['unit_price','amount','base_taxable_value','total_gst']);
// Fields that show as % values
const PCT_FIELDS   = new Set(['cgst_amount','sgst_amount','igst_amount','discount_pct']);

// --- MAIN APP ---
function MainApp() {
  const [files, setFiles]               = useState([]);
  const [results, setResults]           = useState({ items: [] });
  const [loading, setLoading]           = useState(false);
  const [progressMsg, setProgressMsg]   = useState('');
  const [dragOver, setDragOver]         = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingDb, setSavingDb]         = useState(false);
  const [saveMessage, setSaveMessage]   = useState('');
  const [globalProject, setGlobalProject] = useState('');
  const [retrieveLimit, setRetrieveLimit]     = useState('');
  const [retrieveVendor, setRetrieveVendor]   = useState('');
  const [retrieveItem, setRetrieveItem]       = useState('');
  const [retrieving, setRetrieving]           = useState(false);
  const [retrieveError, setRetrieveError]     = useState('');

  const folderInputRef = useRef(null);
  const fileInputRef   = useRef(null);

  // Load SheetJS from CDN once on mount
  useEffect(() => {
    if (window.XLSX) return;
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const safeItems = Array.isArray(results?.items) ? results.items : [];

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files?.length > 0) {
      setFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
    }
  };

  const analyzeBatch = async () => {
    if (files.length === 0) return alert('Please select files or a folder first');
    setLoading(true); setSaveMessage('');
    let accumulatedItems = [...safeItems];

    for (let i = 0; i < files.length; i++) {
      setProgressMsg(`Analyzing ${i + 1} of ${files.length}: ${files[i].name}...`);
      const formData = new FormData();
      formData.append('file', files[i]);

      try {
        const response = await fetch('https://invoiceanalyzerbackend.onrender.com/analyze', { method: 'POST', body: formData });
        const data = await response.json();

        if (data && Array.isArray(data.items)) {
          // Inject ALL top-level invoice fields into every line item
          const enrichedItems = data.items.map(item => ({
            ...item,
            // DOCUMENT
            invoice_date:        data.invoice_date        || 'N/A',
            invoice_no:          data.invoice_no          || 'N/A',
            voucher_type:        data.voucher_type        || 'N/A',
            po_number:           data.po_number           || null,
            reverse_charge:      data.reverse_charge      || 'No',
            paid_to:             data.paid_to             || '',
            place_of_supply:     data.place_of_supply     || 'N/A',
            // SUPPLIER
            vendor_name:         data.vendor_name         || 'Unknown Vendor',
            vendor_address:      data.vendor_address      || '',
            supplier_gstin:      data.supplier_gstin      || '',
            supplier_pan:        data.supplier_pan        || null,
            supplier_state:      data.supplier_state      || '',
            supplier_state_code: data.supplier_state_code || '',
            supplier_email:      data.supplier_email      || null,
            supplier_phone:      data.supplier_phone      || null,
            gstin_numbers:       data.gstin_numbers       || [],
          }));

          accumulatedItems = [...accumulatedItems, ...enrichedItems];
          setResults({ items: accumulatedItems });
        }
      } catch (error) {
        console.error(`Failed on ${files[i].name}:`, error);
      }
    }

    setLoading(false);
    setProgressMsg('');
    setFiles([]);
  };

  const handleUploadToDatabase = async () => {
    if (!results || safeItems.length === 0) return;
    setSavingDb(true); setSaveMessage('');
    try {
      const response = await fetch('https://invoiceanalyzerbackend.onrender.com/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results),
      });
      const data = await response.json();
      setSaveMessage(data.status === 'Success' ? '✅ Successfully saved to Neon!' : '❌ ' + data.status);
    } catch (error) {
      setSaveMessage('❌ Connection failed');
    } finally {
      setSavingDb(false);
    }
  };

  const downloadXlsx = () => {
    if (safeItems.length === 0) return;
    const XLSX = window.XLSX;
    if (!XLSX) return alert('Excel library still loading, please try again in a moment.');

    // Map items to flat rows matching the XLSX backbone column order
    const rows = safeItems.map(item => ({
      // DOCUMENT
      'Invoice Date':       item.invoice_date      || '',
      'Invoice No':         item.invoice_no         || '',
      'Voucher Type':       item.voucher_type       || '',
      'PO Number':          item.po_number          || '',
      'Reverse Charge':     item.reverse_charge     || 'No',
      'Paid To':            item.paid_to            || '',
      'Place of Supply':    item.place_of_supply    || '',
      // SUPPLIER
      'Vendor Name':        item.vendor_name        || '',
      'Vendor Address':     item.vendor_address     || '',
      'Supplier GSTIN':     item.supplier_gstin     || '',
      'Supplier PAN':       item.supplier_pan       || '',
      'Supplier State':     item.supplier_state     || '',
      'Supplier State Code':item.supplier_state_code|| '',
      'Supplier Email':     item.supplier_email     || '',
      'Supplier Phone':     item.supplier_phone     || '',
      'GSTIN Numbers':      Array.isArray(item.gstin_numbers) ? item.gstin_numbers.join(', ') : (item.gstin_numbers || ''),
      // ITEM / LINE
      'Description':        item.description        || '',
      'HSN/SAC':            item.hsn_sac            || '',
      'Type':               item.type               || '',
      'Sub Type':           item.sub_type           || '',
      'UOM':                item.uom                || '',
      'Quantity':           parseNum(item.quantity),
      'Unit Price':         parseNum(item.unit_price),
      'Discount %':         parseNum(item.discount_pct),
      'Discount Amount':    parseNum(item.discount_amount),
      'Base Amount':        parseNum(item.amount),
      'Base Taxable Value': parseNum(item.base_taxable_value) || parseNum(item.amount),
      'Project':            item.project            || '',
      'Project Phase':      item.project_phase      || '',
      'Nature of Expense':  item.nature_of_expense  || '',
      // TAX
      'GST Rate %':         parseNum(item.tax_percentage),
      'Intra / Inter':      item.intra_or_inter     || '',
      'CGST %':             parseNum(item.cgst_amount),
      'SGST %':             parseNum(item.sgst_amount),
      'IGST %':             parseNum(item.igst_amount),
      'CGST ₹':             parseNum(item.cgst_rupee),
      'SGST ₹':             parseNum(item.sgst_rupee),
      'IGST ₹':             parseNum(item.igst_rupee),
      'Cess %':             parseNum(item.cess_pct),
      'Cess ₹':             parseNum(item.cess_amount),
      'Total GST ₹':        parseNum(item.total_gst),
      'Total (incl. Tax)':  getItemTotalWithTax(item),
      // LEDGER
      'Ledger Account':     item.ledger_account     || '',
      'Ledger Group':       item.ledger_group       || '',
      'ITC Eligible':       item.itc_eligible       || 'Yes',
      'ITC Eligible %':     parseNum(item.itc_eligible_pct) || 100,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    // Column widths
    const colWidths = [
      14, 16, 14, 12, 14, 20, 16,   // DOCUMENT
      22, 30, 18, 14, 16, 14, 22, 16, 28, // SUPPLIER
      28, 12, 16, 16, 8, 8, 10, 10, 10, 12, 16, 20, 16, 20, // ITEM
      10, 12, 8, 8, 8, 10, 10, 10, 8, 8, 12, 16, // TAX
      22, 18, 12, 12, // LEDGER
    ];
    ws['!cols'] = colWidths.map(w => ({ wch: w }));

    // Style header row bold
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cellAddr]) continue;
      ws[cellAddr].s = { font: { bold: true } };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invoice Batch');

    // Summary sheet
    const totalBase  = safeItems.reduce((s, i) => s + (parseNum(i.base_taxable_value) || parseNum(i.amount)), 0);
    const totalGst   = safeItems.reduce((s, i) => s + parseNum(i.total_gst), 0);
    const grandTotal = safeItems.reduce((s, i) => s + getItemTotalWithTax(i), 0);
    const uniqueInvoices = [...new Set(safeItems.map(i => i.invoice_no))];

    const summaryRows = [
      { 'Summary': 'Total Line Items',    'Value': safeItems.length },
      { 'Summary': 'Unique Invoices',     'Value': uniqueInvoices.length },
      { 'Summary': 'Total Base Amount',   'Value': totalBase },
      { 'Summary': 'Total GST',           'Value': totalGst },
      { 'Summary': 'Grand Total (w/Tax)', 'Value': grandTotal },
    ];
    const ws2 = XLSX.utils.json_to_sheet(summaryRows);
    ws2['!cols'] = [{ wch: 24 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Summary');

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `TheHouseKraft_Invoices_${date}.xlsx`);
  };

  const fetchFromDatabase = async () => {
    if (!retrieveLimit && !retrieveVendor && !retrieveItem) {
      setRetrieveError('Enter at least one filter — a count, vendor name, or item name.');
      return;
    }
    setRetrieving(true);
    setRetrieveError('');
    try {
      const params = new URLSearchParams();
      if (retrieveLimit)  params.append('limit',       retrieveLimit);
      if (retrieveVendor) params.append('vendor_name', retrieveVendor);
      if (retrieveItem)   params.append('item_name',   retrieveItem);

      const res  = await fetch(`https://invoiceanalyzerbackend.onrender.com/fetch?${params}`);
      const data = await res.json();

      if (data.error) {
        setRetrieveError(`DB Error: ${data.error}`);
      } else if (!data.items || data.items.length === 0) {
        setRetrieveError('No records found for that query.');
      } else {
        setResults({ items: data.items });
        setRetrieveLimit('');
        setRetrieveVendor('');
        setRetrieveItem('');
      }
    } catch (e) {
      setRetrieveError('Connection failed. Is the backend running?');
    } finally {
      setRetrieving(false);
    }
  };

  const getItemTotalWithTax = (item) => {
    const base   = parseNum(item?.base_taxable_value) || parseNum(item?.amount);
    const taxPct = parseNum(item?.tax_percentage);
    return base + (base * taxPct / 100);
  };

  const handleEditClick  = (index, item) => { setEditingIndex(index); setEditFormData({ ...item }); };
  const handleEditChange = (field, value) => setEditFormData({ ...editFormData, [field]: value });
  const handleCancelEdit = () => { setEditingIndex(null); setEditFormData({}); };

  const handleSaveEdit = () => {
    const newItems   = [...safeItems];
    const updatedItem = { ...editFormData };
    updatedItem.quantity           = parseNum(updatedItem.quantity) || 1;
    updatedItem.amount             = parseNum(updatedItem.amount);
    updatedItem.discount_pct       = parseNum(updatedItem.discount_pct);
    updatedItem.discount_amount    = parseNum(updatedItem.discount_amount);
    updatedItem.base_taxable_value = parseNum(updatedItem.base_taxable_value) || updatedItem.amount - updatedItem.discount_amount;
    updatedItem.unit_price         = updatedItem.quantity > 0 ? (updatedItem.amount / updatedItem.quantity) : updatedItem.amount;
    updatedItem.tax_percentage     = parseNum(updatedItem.tax_percentage);
    updatedItem.cgst_amount        = parseNum(updatedItem.cgst_amount);
    updatedItem.sgst_amount        = parseNum(updatedItem.sgst_amount);
    updatedItem.igst_amount        = parseNum(updatedItem.igst_amount);
    const btv = updatedItem.base_taxable_value;
    updatedItem.cgst_rupee  = parseNum(((btv * updatedItem.cgst_amount) / 100).toFixed(2));
    updatedItem.sgst_rupee  = parseNum(((btv * updatedItem.sgst_amount) / 100).toFixed(2));
    updatedItem.igst_rupee  = parseNum(((btv * updatedItem.igst_amount) / 100).toFixed(2));
    updatedItem.total_gst   = parseNum((updatedItem.cgst_rupee + updatedItem.sgst_rupee + updatedItem.igst_rupee).toFixed(2));
    newItems[editingIndex] = updatedItem;
    setResults({ items: newItems });
    setEditingIndex(null);
  };

  const applyProjectToAll = () => {
    if (!globalProject.trim()) return;
    setResults({ items: safeItems.map(item => ({ ...item, project: globalProject })) });
    setGlobalProject('');
  };

  const uniqueInvoicesCount = new Set(safeItems.map(item => item.invoice_no)).size;
  const totalBase   = safeItems.reduce((s, i) => s + parseNum(i.base_taxable_value || i.amount), 0);
  const totalGst    = safeItems.reduce((s, i) => s + parseNum(i.total_gst), 0);
  const grandTotal  = safeItems.reduce((s, i) => s + getItemTotalWithTax(i), 0);

  // Render a single cell value
  const renderCellValue = (col, item) => {
    const val = item[col.key];
    if (col.key === 'type')         return <TypeBadge label={val} />;
    if (col.key === 'itc_eligible') return <Pill label={val || 'Yes'} color={val === 'No' ? 'rgba(255,120,120,0.7)' : 'rgba(80,220,120,0.7)'} />;
    if (col.key === 'intra_or_inter') return <Pill label={val || 'Intra'} color={val === 'Inter' ? 'rgba(255,180,80,0.7)' : 'rgba(120,180,255,0.7)'} />;
    if (col.key === 'reverse_charge') return val === 'Yes' ? <Pill label="RCM" color="rgba(255,120,80,0.8)" /> : '-';
    if (RUPEE_FIELDS.has(col.key))  return `₹${fmt(val)}`;
    if (PCT_FIELDS.has(col.key))    return fmtPct(val);
    if (col.key === 'quantity')     return <span style={{ fontWeight: 700, color: 'rgba(120,190,255,0.9)' }}>{val}</span>;
    return getSafeVal(val) || '-';
  };

  // Render an editable cell
  const renderEditCell = (col) => {
    if (col.key === '_actions') return null;
    const noEdit = ['unit_price'];
    if (noEdit.includes(col.key)) return <span style={{ fontSize: 10, color: 'gray' }}>Auto</span>;
    return (
      <input
        style={{ ...inputStyle, textAlign: col.align === 'right' ? 'right' : 'left' }}
        value={getSafeVal(editFormData[col.key])}
        onChange={e => handleEditChange(col.key, e.target.value)}
      />
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(30,60,140,0.55) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 80% 80%, rgba(80,30,160,0.45) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 50% 50%, rgba(10,20,60,1) 0%, #050814 100%)', fontFamily: "'SF Pro Display', -apple-system, sans-serif", color: 'white', padding: '60px 24px 80px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1800, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* HEADER */}
        <header style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', marginBottom: 16, padding: '6px 18px', borderRadius: 999, background: 'linear-gradient(90deg, rgba(80,140,255,0.15), rgba(120,80,255,0.15))', border: '0.5px solid rgba(120,180,255,0.25)', fontSize: 12, letterSpacing: '0.15em', fontWeight: 600, color: 'rgba(160,200,255,0.8)' }}>
            TheHouseKraft
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 12px', background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(180,200,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Invoice Analyzer
          </h1>
        </header>

        {/* RETRIEVE FROM DB PANEL */}
        <div style={{ maxWidth: 720, margin: '0 auto 28px' }}>
          <GlassCard style={{ padding: '28px 32px' }}>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(160,200,255,0.9)', textTransform: 'uppercase' }}>
                Retrieve Past Records
              </span>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(150,160,200,0.55)' }}>
                Pull saved invoices from the database by count, vendor, or item name. Fields can be combined.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
              {/* Last N records */}
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(140,160,200,0.5)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Last N Records
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 50"
                  value={retrieveLimit}
                  onChange={e => setRetrieveLimit(e.target.value)}
                  style={{ ...inputStyle, padding: '9px 12px' }}
                />
              </div>
              {/* Vendor name */}
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(140,160,200,0.5)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Vendor Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ashoka Traders"
                  value={retrieveVendor}
                  onChange={e => setRetrieveVendor(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchFromDatabase()}
                  style={{ ...inputStyle, padding: '9px 12px' }}
                />
              </div>
              {/* Item name */}
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(140,160,200,0.5)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Item / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cement"
                  value={retrieveItem}
                  onChange={e => setRetrieveItem(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchFromDatabase()}
                  style={{ ...inputStyle, padding: '9px 12px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                onClick={fetchFromDatabase}
                disabled={retrieving}
                style={{ padding: '10px 24px', borderRadius: 10, border: '0.5px solid rgba(120,160,255,0.35)', background: retrieving ? 'rgba(80,120,255,0.1)' : 'linear-gradient(135deg, rgba(80,130,255,0.3) 0%, rgba(100,60,220,0.2) 100%)', color: retrieving ? 'rgba(255,255,255,0.4)' : 'white', fontWeight: 700, fontSize: 13, cursor: retrieving ? 'not-allowed' : 'pointer', letterSpacing: '0.05em' }}
              >
                {retrieving ? 'Fetching…' : '⬆ Retrieve from Database'}
              </button>
              {retrieveError && (
                <span style={{ fontSize: 12, color: 'rgba(255,110,110,0.9)', fontWeight: 600 }}>{retrieveError}</span>
              )}
            </div>
          </GlassCard>
        </div>

        {/* UPLOAD CARD */}
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <GlassCard style={{ padding: 36 }}>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 160, borderRadius: 16, border: `1.5px dashed ${dragOver ? 'rgba(100,170,255,0.6)' : 'rgba(255,255,255,0.12)'}`, background: dragOver ? 'rgba(80,140,255,0.08)' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s' }}
            >
              <p style={{ fontSize: 14, color: 'rgba(200,215,255,0.8)', margin: '0 0 12px' }}>Drag and drop files, or click below:</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => fileInputRef.current.click()} style={{ ...actionBtnStyle, padding: '8px 16px', background: 'rgba(100,160,255,0.15)', borderColor: 'rgba(100,160,255,0.3)' }}>Select Files</button>
                <button onClick={() => folderInputRef.current.click()} style={{ ...actionBtnStyle, padding: '8px 16px', background: 'rgba(180,100,255,0.15)', borderColor: 'rgba(180,100,255,0.3)' }}>Select Folder</button>
              </div>
              <input type="file" accept="image/*" multiple style={{ display: 'none' }} ref={fileInputRef} onChange={e => setFiles(Array.from(e.target.files))} />
              <input type="file" accept="image/*" multiple webkitdirectory="true" style={{ display: 'none' }} ref={folderInputRef} onChange={e => setFiles(Array.from(e.target.files).filter(f => f.type.startsWith('image/')))} />
              <p style={{ fontSize: 12, color: 'rgba(150,160,200,0.5)', margin: '16px 0 0' }}>
                {files.length > 0 ? `${files.length} images queued` : 'PNG, JPG or JPEG'}
              </p>
            </div>
            <button onClick={analyzeBatch} disabled={loading || files.length === 0} style={{ marginTop: 24, width: '100%', padding: '14px 32px', borderRadius: 14, border: '0.5px solid rgba(255,255,255,0.2)', background: loading ? 'rgba(60,100,200,0.3)' : 'linear-gradient(135deg, rgba(70,130,255,0.55) 0%, rgba(100,60,220,0.45) 100%)', color: 'white', fontWeight: 700, fontSize: 15, cursor: (loading || files.length === 0) ? 'not-allowed' : 'pointer', opacity: (loading || files.length === 0) ? 0.7 : 1 }}>
              {loading ? progressMsg : 'Analyze Batch'}
            </button>
          </GlassCard>
        </div>

        {/* RESULTS TABLE */}
        {safeItems.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <GlassCard style={{ padding: 0, overflow: 'hidden' }}>

              {/* Table header bar */}
              <div style={{ padding: '16px 24px', borderBottom: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(160,200,255,0.9)', textTransform: 'uppercase' }}>Master Batch Table</span>
                  <span style={{ fontSize: 12, color: 'rgba(140,160,200,0.7)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    TOTAL ITEMS: <span style={{ color: 'white' }}>{safeItems.length}</span> &nbsp;|&nbsp; UNIQUE INVOICES: <span style={{ color: 'white' }}>{uniqueInvoicesCount}</span>
                  </span>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 2800 }}>
                  {/* Column group row */}
                  <thead>
                    <tr>
                      {COL_GROUPS.map((g, gi) => (
                        <th key={gi} colSpan={g.span} style={{ padding: '6px 12px', fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: g.color, textTransform: 'uppercase', textAlign: 'center', borderBottom: `1px solid ${g.color}`, background: 'rgba(255,255,255,0.015)' }}>
                          {g.label}
                        </th>
                      ))}
                    </tr>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      {COLS.map(col => (
                        <th key={col.key} style={{ padding: '10px 12px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(140,170,220,0.6)', textTransform: 'uppercase', textAlign: col.align, borderBottom: '0.5px solid rgba(255,255,255,0.06)', minWidth: col.minW, whiteSpace: 'nowrap' }}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safeItems.map((item, i) => {
                      const isEditing = editingIndex === i;
                      return (
                        <tr key={i} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)', background: isEditing ? 'rgba(255,255,255,0.05)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)' }}>
                          {COLS.map(col => {
                            if (col.key === '_actions') {
                              return (
                                <td key={col.key} style={{ padding: '10px 12px', textAlign: 'center', minWidth: col.minW }}>
                                  {isEditing ? (
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                      <button style={{ ...actionBtnStyle, background: 'rgba(80,200,120,0.2)', borderColor: 'rgba(80,200,120,0.5)' }} onClick={handleSaveEdit}>Save</button>
                                      <button style={{ ...actionBtnStyle, background: 'rgba(255,100,100,0.2)', borderColor: 'rgba(255,100,100,0.5)' }} onClick={handleCancelEdit}>X</button>
                                    </div>
                                  ) : (
                                    <button style={actionBtnStyle} onClick={() => handleEditClick(i, item)}>Edit</button>
                                  )}
                                </td>
                              );
                            }
                            return (
                              <td key={col.key} style={{ padding: '10px 12px', fontSize: col.key === 'description' ? 13 : 11, textAlign: col.align, color: col.mono ? 'rgba(180,200,240,0.6)' : 'rgba(200,215,255,0.82)', fontFamily: col.mono ? 'monospace' : 'inherit', minWidth: col.minW, whiteSpace: col.key === 'description' || col.key === 'ledger_account' || col.key === 'nature_of_expense' ? 'normal' : 'nowrap' }}>
                                {isEditing ? renderEditCell(col) : renderCellValue(col, item)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* FOOTER */}
              <div style={{ padding: '20px 24px', borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', background: 'rgba(255,255,255,0.015)' }}>
                {/* Bulk Project Assign */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, color: 'rgba(150,160,200,0.6)', letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }}>Bulk Assign Project</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input style={{ ...inputStyle, width: 220, padding: '10px 14px', fontSize: 14, background: 'rgba(0,0,0,0.3)' }} placeholder="e.g., Villa 44..." value={globalProject} onChange={e => setGlobalProject(e.target.value)} />
                    <button onClick={applyProjectToAll} style={{ ...actionBtnStyle, padding: '0 16px', borderRadius: 6, background: 'rgba(100,160,255,0.2)', borderColor: 'rgba(100,160,255,0.4)' }}>Apply to All</button>
                  </div>
                </div>

                {/* Totals */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  {[
                    { label: 'Total Base Amount:', value: `₹${fmt(totalBase)}`, style: { fontSize: 13, color: 'rgba(200,210,240,0.85)' } },
                    { label: 'Total GST:', value: `₹${fmt(totalGst)}`, style: { fontSize: 13, color: 'rgba(255,180,80,0.85)' } },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', width: 340, gap: 16 }}>
                      <span style={{ fontSize: 13, color: 'rgba(150,160,200,0.6)' }}>{row.label}</span>
                      <span style={row.style}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: 340, gap: 16, marginTop: 8, paddingTop: 16, borderTop: '1px dashed rgba(255,255,255,0.15)' }}>
                    <span style={{ fontSize: 15, color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Grand Batch Total:</span>
                    <span style={{ fontSize: 24, fontWeight: 800, color: 'white' }}>₹{fmt(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* SAVE BUTTON */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 24, gap: 12 }}>
              {saveMessage && (
                <span style={{ fontSize: 13, color: saveMessage.includes('✅') ? 'rgba(80,220,120,0.9)' : 'rgba(255,100,100,0.9)', fontWeight: 600 }}>{saveMessage}</span>
              )}
              {/* Download XLSX */}
              <button
                onClick={downloadXlsx}
                style={{ padding: '12px 28px', borderRadius: 12, border: '0.5px solid rgba(80,160,255,0.4)', background: 'linear-gradient(135deg, rgba(40,100,255,0.2) 0%, rgba(20,60,180,0.1) 100%)', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(40,100,255,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <span style={{ fontSize: 16 }}>⬇</span> Download as Excel
              </button>
              {/* Upload to Neon */}
              <button
                onClick={handleUploadToDatabase}
                disabled={savingDb}
                style={{ padding: '12px 28px', borderRadius: 12, border: '0.5px solid rgba(80,200,120,0.4)', background: savingDb ? 'rgba(80,200,120,0.1)' : 'linear-gradient(135deg, rgba(60,180,100,0.2) 0%, rgba(40,140,80,0.1) 100%)', color: savingDb ? 'rgba(255,255,255,0.5)' : 'white', fontWeight: 700, fontSize: 14, cursor: savingDb ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(40,160,80,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <span style={{ fontSize: 16 }}>☁</span> {savingDb ? 'Uploading...' : 'Upload to Database'}
              </button>
            </div>
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
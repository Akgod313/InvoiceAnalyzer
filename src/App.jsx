import { useState } from "react";

function formatMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}

function formatPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n * 10) / 10;
  return (Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)) + "%";
}

function App() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://invoiceanalyzerbackend.onrender.com/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to process the invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-canvas">
      <div className="glass-blob glass-blob--a" aria-hidden />
      <div className="glass-blob glass-blob--b" aria-hidden />

      <div className="glass-wrap">
        <header className="glass-hero">
          <h1 className="glass-title">Invoice Analyzer</h1>
          <p className="glass-subtitle">
            Upload a handwritten or printed invoice to categorize materials with
            a clear, glanceable breakdown.
          </p>
        </header>

        <div className="glass-panel glass-panel--pad glass-drop">
          <div className="glass-file-row">
            <input
              id="invoice-file"
              className="glass-file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <label htmlFor="invoice-file" className="glass-file-label">
              Choose image
            </label>
            {file ? (
              <span className="glass-file-name" title={file.name}>
                {file.name}
              </span>
            ) : (
              <span className="glass-file-name">No file selected</span>
            )}
          </div>

          <button
            type="button"
            className="glass-btn"
            onClick={handleUpload}
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <span className="glass-spinner" aria-hidden />
                Analyzing…
              </>
            ) : (
              "Analyze Quote"
            )}
          </button>
        </div>

        {error && (
          <div className="glass-error" role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        {results && results.length > 0 ? (
          <div className="glass-table-scroll">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Item Name</th>
                  <th className="px-4 py-2 border">Type</th>
                  <th className="px-4 py-2 border">Sub-Type</th>
                  <th className="px-4 py-2 border">Paid To</th>
                  <th className="px-4 py-2 border">GSTIN(s)</th>
                  <th className="px-4 py-2 border">Qty</th>
                  <th className="px-4 py-2 border">Unit Price</th>
                  <th className="px-4 py-2 border">Total</th>
                </tr>
              </thead>
            <tbody>
              {results.items?.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 text-sm">
                <td className="px-4 py-2 border font-medium">{item.description}</td>
                <td className="px-4 py-2 border">{item.type}</td>
                <td className="px-4 py-2 border">{item.sub_type}</td>
                {/* We show the top-level invoice data in every row for clarity */}
                <td className="px-4 py-2 border">{results.paid_to || "N/A"}</td>
                <td className="px-4 py-2 border">
                  {results.gstin_numbers ? results.gstin_numbers.join(", ") : "N/A"}
                </td>
                <td className="px-4 py-2 border text-center font-bold">{item.quantity}</td>
                <td className="px-4 py-2 border text-right">₹{item.unit_price?.toLocaleString()}</td>
                <td className="px-4 py-2 border text-right font-semibold">₹{item.amount?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
          </div>
        ) : (
          !loading &&
          !error && (
            <p className="glass-empty">No data to display yet.</p>
          )
        )}
      </div>
    </div>
  );
}

export default App;

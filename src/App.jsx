import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const analyzeQuote = async () => {
    if (!file) return alert("Please select an image first");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Use your actual Render URL here
      const response = await fetch("https://your-backend-url.onrender.com/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      alert("Analysis failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Invoice Analyzer
        </h1>
        <p className="text-gray-400 mb-10">Upload a quotation to categorize materials instantly.</p>
        
        {/* Upload Box */}
        <div className="bg-[#1e293b] border-2 border-dashed border-blue-500/30 p-12 rounded-3xl shadow-2xl transition-all hover:border-blue-500/60">
          <input 
            type="file" 
            accept="image/*" // FORCE IMAGES ONLY
            onChange={handleFileChange} 
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor:pointer"
          />
          <button 
            onClick={analyzeQuote}
            disabled={loading}
            className="mt-8 bg-gradient-to-r from-blue-600 to-blue-500 px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : "Analyze Quote"}
          </button>
        </div>

        {/* New Results Table */}
        {results && results.items && (
          <div className="mt-12 overflow-hidden rounded-2xl border border-gray-700 bg-[#1e293b] shadow-2xl animate-in fade-in duration-500">
            <table className="w-full text-left">
              <thead className="bg-[#334155] text-blue-300 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Paid To</th>
                  <th className="p-4">GSTIN</th>
                  <th className="p-4 text-center">Qty</th>
                  <th className="p-4 text-right">Unit Price</th>
                  <th className="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {results.items.map((item, i) => (
                  <tr key={i} className="hover:bg-blue-900/10 transition-colors">
                    <td className="p-4 text-sm font-medium">{item.description}</td>
                    <td className="p-4 text-sm text-gray-400">{item.type}</td>
                    <td className="p-4 text-sm text-gray-400">{results.paid_to}</td>
                    <td className="p-4 text-sm text-gray-400 font-mono text-[10px]">
                      {results.gstin_numbers?.join(", ") || "N/A"}
                    </td>
                    <td className="p-4 text-center font-bold text-blue-400">{item.quantity}</td>
                    <td className="p-4 text-right text-gray-300">₹{item.unit_price}</td>
                    <td className="p-4 text-right font-bold text-white">₹{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzeQuote = async () => {
    if (!file) return alert("Please select an image first");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Ensure this points to your specific Render URL
      const response = await fetch("https://your-backend-name.onrender.com/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Server connection failed. Is Render awake?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white font-sans selection:bg-blue-500/30">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-6xl font-black tracking-tight mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Invoice Analyzer
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Upload a handwritten or printed invoice to categorize materials with a clear, glanceable breakdown.
          </p>
        </header>

        {/* Liquid Glass Upload Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-[#161b2c]/80 backdrop-blur-xl border border-white/10 p-12 rounded-[2rem] shadow-2xl flex flex-col items-center">
            
            <div className="w-full max-w-md">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <p className="text-sm text-gray-400">
                    <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{file ? file.name : "PNG, JPG or JPEG"}</p>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange} 
                />
              </label>
            </div>

            <button 
              onClick={analyzeQuote}
              disabled={loading}
              className="mt-8 px-12 py-4 bg-blue-600 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : "Analyze Quote"}
            </button>
          </div>
        </div>

        {/* Results Table - Glassmorphism Style */}
        {results && results.items && (
          <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/10 text-blue-300 text-[10px] uppercase tracking-[0.2em] font-bold">
                    <th className="p-5">Item Name</th>
                    <th className="p-5">Type</th>
                    <th className="p-5">Paid To</th>
                    <th className="p-5">GSTIN(s)</th>
                    <th className="p-5 text-center">Qty</th>
                    <th className="p-5 text-right">Unit Price</th>
                    <th className="p-5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.items.map((item, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-5 text-sm font-medium text-white/90">{item.description}</td>
                      <td className="p-5 text-xs text-gray-400">
                        <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {item.type}
                        </span>
                      </td>
                      <td className="p-5 text-xs text-gray-400">{results.paid_to || "N/A"}</td>
                      <td className="p-5 text-[10px] font-mono text-gray-500">
                        {results.gstin_numbers?.join(", ") || "N/A"}
                      </td>
                      <td className="p-5 text-center font-bold text-blue-400">{item.quantity}</td>
                      <td className="p-5 text-right text-gray-400">₹{item.unit_price?.toLocaleString()}</td>
                      <td className="p-5 text-right font-bold text-white">₹{item.amount?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
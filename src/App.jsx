import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResults(null); // Clear previous results
  };

  const analyzeQuote = async () => {
    if (!file) return alert("Please select an image first");
    
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // REPLACE THIS URL WITH YOUR ACTUAL RENDER URL
      const response = await fetch("https://your-backend-url.onrender.com/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Response:", data); // Check console for this!
      setResults(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Invoice Analyzer</h1>
      
      <div className="flex flex-col items-center gap-4 bg-gray-800 p-10 rounded-xl">
        <input type="file" onChange={handleFileChange} className="text-white" />
        <button 
          onClick={analyzeQuote}
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 disabled:bg-gray-500"
        >
          {loading ? "Analyzing..." : "Analyze Quote"}
        </button>
      </div>

      {/* RESULT SECTION */}
      <div className="mt-10">
        {results && results.items && results.items.length > 0 ? (
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 border">Item Name</th>
                  <th className="p-3 border">Type</th>
                  <th className="p-3 border">Paid To</th>
                  <th className="p-3 border">GSTIN</th>
                  <th className="p-3 border text-center">Qty</th>
                  <th className="p-3 border text-right">Unit Price</th>
                  <th className="p-3 border text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {results.items.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-3 border">{item.description}</td>
                    <td className="p-3 border">{item.type}</td>
                    <td className="p-3 border">{results.paid_to}</td>
                    <td className="p-3 border">{results.gstin_numbers?.join(", ")}</td>
                    <td className="p-3 border text-center">{item.quantity}</td>
                    <td className="p-3 border text-right">₹{item.unit_price}</td>
                    <td className="p-3 border text-right font-bold">₹{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && <p className="text-center text-gray-400 mt-4">No data to display yet.</p>
        )}
      </div>
    </div>
  );
}

export default App;
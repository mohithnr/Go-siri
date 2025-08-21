"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Cow = { _id: string; name: string; tag?: string };
type MilkRecord = { _id: string; date: string; morningMilk: number; eveningMilk: number; totalMilk: number };

export default function MilkPage() {
  const { token } = useAuth();
  const [cows, setCows] = useState<Cow[]>([]);
  const [selectedCow, setSelectedCow] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [morningMilk, setMorning] = useState<string>("0");
  const [eveningMilk, setEvening] = useState<string>("0");
  const [history, setHistory] = useState<MilkRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    loadCows();
  }, [token]);

  useEffect(() => {
    if (!selectedCow) return setHistory([]);
    loadHistory();
  }, [selectedCow]);

  async function loadCows() {
    try {
      const cowsData = await apiFetch<Cow[]>("/cows/list");
      setCows(cowsData);
    } catch (error) {
      console.error("Failed to load cows:", error);
      setMessage({ type: 'error', text: 'Failed to load cows. Please try again.' });
    }
  }

  async function loadHistory() {
    try {
      const historyData = await apiFetch<MilkRecord[]>(`/milk/list/${selectedCow}`);
      setHistory(historyData);
    } catch (error) {
      console.error("Failed to load history:", error);
      setMessage({ type: 'error', text: 'Failed to load milk history.' });
    }
  }

  async function addRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCow) {
      setMessage({ type: 'error', text: 'Please select a cow' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await apiFetch("/milk/add", {
        method: "POST",
        body: JSON.stringify({ 
          cowId: selectedCow, 
          date, 
          morningMilk: Number(morningMilk), 
          eveningMilk: Number(eveningMilk) 
        }),
      });
      
      setMessage({ type: 'success', text: 'Milk record added successfully!' });
      setMorning("0");
      setEvening("0");
      await loadHistory();
    } catch (error) {
      console.error("Failed to add milk record:", error);
      setMessage({ 
        type: 'error', 
        text: `Failed to add milk record: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setLoading(false);
    }
  }

  if (!token) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
        <a href="/login" className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
          Go to Login
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🥛 Milk Production Records</h1>
          <p className="text-gray-600">Track daily milk production for your herd</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 border border-green-200 text-green-800' 
              : 'bg-red-100 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Add Milk Record Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Milk Record</h2>
          <form onSubmit={addRecord} className="grid md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Cow *</label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900"
                value={selectedCow} 
                onChange={(e) => setSelectedCow(e.target.value)}
                required
              >
                <option value="">Choose a cow...</option>
                {cows.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}{c.tag ? ` (${c.tag})` : ""}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900"
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Morning Milk (L)</label>
              <input 
                type="number" 
                step="0.1" 
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900"
                value={morningMilk} 
                onChange={(e) => setMorning(e.target.value)} 
                placeholder="0.0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Evening Milk (L)</label>
              <input 
                type="number" 
                step="0.1" 
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900"
                value={eveningMilk} 
                onChange={(e) => setEvening(e.target.value)} 
                placeholder="0.0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total</label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium">
                {(Number(morningMilk) + Number(eveningMilk)).toFixed(1)} L
              </div>
            </div>
            
            <div>
              <button 
                disabled={loading || !selectedCow}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Record"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Milk History */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Milk Production History</h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedCow ? `Records for selected cow (${history.length} entries)` : 'Select a cow to view history'}
            </p>
          </div>
          
          {!selectedCow ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a cow</h3>
              <p className="text-gray-500">Choose a cow from the dropdown above to view milk production history</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🥛</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No records yet</h3>
              <p className="text-gray-500">Add the first milk record for this cow</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Morning (L)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evening (L)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (L)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((r, index) => (
                    <tr key={r._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(r.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {r.morningMilk} L
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {r.eveningMilk} L
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {r.totalMilk} L
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



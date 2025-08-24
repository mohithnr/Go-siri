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

  const totalProduction = (Number(morningMilk) + Number(eveningMilk)).toFixed(1);

  // Calculate statistics for selected cow
  const totalMilkProduced = history.reduce((sum, record) => sum + record.totalMilk, 0);
  const avgDaily = history.length > 0 ? (totalMilkProduced / history.length).toFixed(1) : "0";

  if (!token) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-l-4 border-blue-700 text-center max-w-md w-full">
        <div className="text-6xl mb-6">🔐</div>
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please login to access the milk production system</p>
        <a 
          href="/login" 
          className="bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg inline-block"
        >
          Go to Login
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🥛</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-700 leading-tight">Milk Production Records</h1>
              <p className="text-sm md:text-base text-gray-600">Track daily milk production for your dairy herd</p>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl shadow-sm transition-all duration-300 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800 border-l-4 border-l-green-600' 
              : 'bg-red-50 border border-red-200 text-red-800 border-l-4 border-l-red-600'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {message.type === 'success' ? '✅' : '❌'}
              </span>
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {selectedCow && history.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 border-emerald-600 group hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-emerald-600">{history.length}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-600">📊</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 border-blue-600 group hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Produced</p>
                  <p className="text-2xl font-bold text-blue-600">{totalMilkProduced.toFixed(1)}L</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600">🥛</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 border-amber-600 group hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Daily Average</p>
                  <p className="text-2xl font-bold text-amber-600">{avgDaily}L</p>
                </div>
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-amber-600">📈</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 border-green-600 group hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Best Day</p>
                  <p className="text-2xl font-bold text-green-600">
                    {history.length > 0 ? Math.max(...history.map(h => h.totalMilk)).toFixed(1) : "0"}L
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600">🏆</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Milk Record Form */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 border-emerald-600 mb-6 md:mb-8 group">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-emerald-600">➕</span>
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Record Milk Production</h2>
          </div>
          
          <form onSubmit={addRecord} className="space-y-4 xl:space-y-0 xl:grid xl:grid-cols-6 xl:gap-4 xl:items-end">
            <div className="space-y-4 xl:space-y-0 xl:contents">
              {/* Cow Selection */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Select Cow *
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                  value={selectedCow} 
                  onChange={(e) => setSelectedCow(e.target.value)}
                  required
                >
                  <option value="" disabled>Choose a cow...</option>
                  {cows.map((c) => (
                    <option key={c._id} value={c._id}>
                      🐄 {c.name}{c.tag ? ` (#${c.tag})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Production Date *
                </label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              
              {/* Morning Milk */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Morning (L)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 pr-8"
                    value={morningMilk} 
                    onChange={(e) => setMorning(e.target.value)} 
                    placeholder="0.0"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-blue-600">🌅</span>
                  </div>
                </div>
              </div>
              
              {/* Evening Milk */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Evening (L)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 pr-8"
                    value={eveningMilk} 
                    onChange={(e) => setEvening(e.target.value)} 
                    placeholder="0.0"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-amber-600">🌙</span>
                  </div>
                </div>
              </div>
              
              {/* Total Display */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Total Production
                </label>
                <div className="w-full px-4 py-3 bg-gradient-to-r from-amber-50 to-emerald-50 border-2 border-amber-200 rounded-lg font-semibold text-amber-700 flex items-center justify-between">
                  <span>{totalProduction} L</span>
                  <span className="text-lg">🥛</span>
                </div>
              </div>
              
              {/* Submit Button */}
              <div>
                <button 
                  disabled={loading || !selectedCow}
                  className="w-full bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>📝</span>
                      <span>Save Record</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Milk Production History */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-blue-700 group overflow-hidden">
          <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-50 to-emerald-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-700">📋</span>
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-blue-700">Production History</h2>
                  <p className="text-sm text-gray-600">
                    {selectedCow ? `Showing ${history.length} records for selected cow` : 'Select a cow to view production history'}
                  </p>
                </div>
              </div>
              {selectedCow && history.length > 0 && (
                <div className="bg-white px-3 py-1 rounded-full shadow-sm">
                  <span className="text-2xl font-bold text-amber-600">{history.length}</span>
                </div>
              )}
            </div>
          </div>
          
          {!selectedCow ? (
            <div className="text-center py-16 px-4">
              <div className="text-8xl mb-6">🐄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Select a Cow</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Choose a cow from the dropdown above to view their milk production history and statistics
              </p>
              <div className="bg-gradient-to-r from-blue-700 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium inline-block shadow-md">
                👆 Select from the form above
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="text-8xl mb-6">🥛</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Production Records</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start tracking milk production by adding the first record for this cow
              </p>
              <div className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white px-6 py-2 rounded-lg font-medium inline-block shadow-md">
                Add your first record above 📝
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              {/* Mobile Card View */}
              <div className="block lg:hidden">
                <div className="divide-y divide-gray-200">
                  {history.map((record, index) => (
                    <div key={record._id} className="p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 transition-colors duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-lg">📅</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {new Date(record.date).toLocaleDateString('en-IN')}
                            </h3>
                            <p className="text-sm text-gray-500">Production Record</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-amber-600">{record.totalMilk}L</div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <div className="text-blue-600 mb-1">🌅</div>
                          <div className="text-sm font-medium text-blue-800">{record.morningMilk}L</div>
                          <div className="text-xs text-blue-600">Morning</div>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 text-center">
                          <div className="text-amber-600 mb-1">🌙</div>
                          <div className="text-sm font-medium text-amber-800">{record.eveningMilk}L</div>
                          <div className="text-xs text-amber-600">Evening</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        Production Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        Morning Yield
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        Evening Yield
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        Total Production
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {history.map((record, index) => (
                      <tr 
                        key={record._id} 
                        className={`transition-colors duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 text-sm">📅</span>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {new Date(record.date).toLocaleDateString('en-IN', { 
                                  weekday: 'short', 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </div>
                              <div className="text-xs text-gray-500">Production Date</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🌅</span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 shadow-sm">
                              {record.morningMilk} L
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🌙</span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 shadow-sm">
                              {record.eveningMilk} L
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🥛</span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 shadow-sm">
                              {record.totalMilk} L
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type FinanceRow = { 
  _id: string; 
  date: string; 
  milkIncome: number; 
  expense: number; 
  profitLoss: number 
};

type RecalcResult = { 
  updatedDays: number; 
  message: string;
  dateRange: { from: string; to: string };
};

type PriceScope = "prev15" | "next15" | "fromDate";

type PriceHistory = {
  _id: string;
  pricePerLiter: number;
  effectiveFrom: string;
};

type CurrentPrices = {
  current: PriceHistory | null;
  history: PriceHistory[];
};

export default function SalesPage() {
  const { token } = useAuth();
  const [history, setHistory] = useState<FinanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Price management state
  const [priceDate, setPriceDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [priceValue, setPriceValue] = useState<string>("0");
  const [priceScope, setPriceScope] = useState<PriceScope>("fromDate");
  const [priceLoading, setPriceLoading] = useState(false);
  const [currentPrices, setCurrentPrices] = useState<CurrentPrices>({ current: null, history: [] });

  async function loadHistory() {
    try {
      setLoading(true);
      const rows = await apiFetch<FinanceRow[]>(`/finance/history`);
      setHistory(rows);
    } catch (error) {
      console.error("Failed to load history:", error);
      setMessage({ type: 'error', text: 'Failed to load financial history.' });
    } finally {
      setLoading(false);
    }
  }

  async function loadPrices() {
    try {
      const prices = await apiFetch<CurrentPrices>(`/finance/prices`);
      setCurrentPrices(prices);
      if (prices.current) {
        setPriceValue(prices.current.pricePerLiter.toString());
      }
    } catch (error) {
      console.error("Failed to load prices:", error);
    }
  }

  useEffect(() => { 
    if (token) {
      loadHistory();
      loadPrices();
    }
  }, [token]);

  // Price management: set price and recalc
  async function applyPrice(e: React.FormEvent) {
    e.preventDefault();
    if (Number(priceValue) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid milk price' });
      return;
    }

    setPriceLoading(true);
    setMessage(null);

    try {
      // 1) Set the new price
      await apiFetch("/finance/price/set", {
        method: "POST",
        body: JSON.stringify({ 
          pricePerLiter: Number(priceValue), 
          effectiveFrom: priceDate 
        })
      });

      // 2) Determine range and recalc sales
      const effective = new Date(priceDate);
      const dayMs = 24 * 60 * 60 * 1000;
      let from: Date | undefined;
      let to: Date | undefined;

      if (priceScope === "prev15") {
        from = new Date(effective.getTime() - 15 * dayMs);
        to = effective;
      } else if (priceScope === "next15") {
        from = effective;
        to = new Date(effective.getTime() + 15 * dayMs);
      } else {
        // from date onward: recalc a wide forward range (e.g., 1 year)
        from = effective;
        to = new Date(effective.getTime() + 365 * dayMs);
      }

      const payload: Record<string, string> = {};
      if (from) payload.from = from.toISOString().slice(0, 10);
      if (to) payload.to = to.toISOString().slice(0, 10);

      const result = await apiFetch<RecalcResult>("/finance/sales/recalc", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setMessage({ 
        type: 'success', 
        text: `Price updated! ${result.message} from ${result.dateRange.from} to ${result.dateRange.to}` 
      });
      
      await loadHistory();
      await loadPrices();
    } catch (error) {
      console.error("Failed to update price/recalc:", error);
      setMessage({ 
        type: 'error', 
        text: `Failed to update price: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setPriceLoading(false);
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
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">💰 Sales Management</h1>
          <p className="text-xl text-gray-600">
            Manage milk prices and view sales history. Sales are automatically calculated when you add milk data.
          </p>
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

        {/* Current Price Info */}
        {currentPrices.current && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-blue-900 mb-2">Current Milk Price</h2>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-blue-900">
                    ₹{currentPrices.current.pricePerLiter.toFixed(2)}/liter
                  </span>
                  <span className="text-blue-700">
                    Effective from: {new Date(currentPrices.current.effectiveFrom).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-600 bg-blue-100 px-3 py-2 rounded-lg">
                  💡 Sales are automatically calculated when you add milk data
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Milk Price Management */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Update Milk Price</h2>
            <form onSubmit={applyPrice} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Effective Date *</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900"
                    value={priceDate} 
                    onChange={(e) => setPriceDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price per Liter (₹) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900"
                    value={priceValue} 
                    onChange={(e) => setPriceValue(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recalculate Sales For</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900"
                  value={priceScope}
                  onChange={(e) => setPriceScope(e.target.value as PriceScope)}
                >
                  <option value="prev15">Previous 15 days</option>
                  <option value="next15">Next 15 days</option>
                  <option value="fromDate">From this date onward</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  This will recalculate sales based on actual milk data and new price
                </p>
              </div>

              <button 
                disabled={priceLoading || Number(priceValue) <= 0}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {priceLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Price...
                  </span>
                ) : (
                  "Update Price & Recalculate"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Debug Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-yellow-900 mb-4">🔍 Debug Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-yellow-800 mb-2">Test Recalculation</h3>
              <p className="text-sm text-yellow-700 mb-3">
                Click to test if recalculation is working for the last 15 days
              </p>
              <button 
                onClick={async () => {
                  try {
                    const result = await apiFetch<RecalcResult>("/finance/sales/recalc", {
                      method: "POST",
                      body: JSON.stringify({ 
                        from: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                        to: new Date().toISOString().slice(0, 10)
                      })
                    });
                    setMessage({ type: 'success', text: `Debug: ${result.message}` });
                    await loadHistory();
                  } catch (error) {
                    setMessage({ type: 'error', text: `Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
                  }
                }}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition-colors"
              >
                Test Recalc (Last 15 Days)
              </button>
            </div>
            <div>
              <h3 className="font-medium text-yellow-800 mb-2">Check Milk Records</h3>
              <p className="text-sm text-yellow-700 mb-3">
                Check if milk records exist for debugging
              </p>
              <button 
                onClick={async () => {
                  try {
                    const debug = await apiFetch<{milkRecordsCount: number}>("/finance/debug");
                    console.log('Debug info:', debug);
                    setMessage({ type: 'success', text: `Debug: Found ${debug.milkRecordsCount} milk records` });
                  } catch (error) {
                    setMessage({ type: 'error', text: `Debug check failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
                  }
                }}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition-colors"
              >
                Check Milk Records
              </button>
            </div>
          </div>
        </div>

        {/* Price History */}
        {currentPrices.history.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Price Changes</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effective Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price per Liter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentPrices.history.slice(0, 5).map((price, index) => (
                    <tr key={price._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(price.effectiveFrom).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        ₹{price.pricePerLiter.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sales History */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Sales History</h2>
            <p className="text-sm text-gray-600 mt-1">
              Daily sales records ({history.length} entries) - Automatically calculated from milk data
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading sales history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sales records yet</h3>
              <p className="text-gray-500">Start by adding milk data - sales will be calculated automatically!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Milk Income</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Profit</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((r, index) => (
                    <tr key={r._id} className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(r.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ₹{r.milkIncome?.toFixed(2) || '0.00'}
                        </span>
                        {r.milkIncome > 0 && (
                          <span className="ml-2 text-xs text-gray-500">auto</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ₹{r.expense?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (r.profitLoss || 0) >= 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          ₹{r.profitLoss?.toFixed(2) || '0.00'}
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
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-emerald-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="text-center bg-white rounded-xl shadow-lg p-8 sm:p-12 max-w-md w-full border-l-4 border-blue-700">
        <div className="mb-6">
          <div className="text-6xl mb-4">🐄</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-2">Access Required</h2>
          <p className="text-gray-600">Please login to manage sales and pricing</p>
        </div>
        <a 
          href="/login" 
          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg inline-block w-full sm:w-auto"
        >
          Go to Login
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
              <span className="text-xl sm:text-2xl">💰</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-700">
                Sales Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage milk prices and view sales history
              </p>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl border-l-4 shadow-md ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-600 text-green-800' 
              : 'bg-red-50 border-red-600 text-red-800'
          }`}>
            <div className="flex items-start">
              <span className="text-xl mr-3">
                {message.type === 'success' ? '✅' : '❌'}
              </span>
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Current Price Info */}
        {currentPrices.current && (
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 border-amber-600 mb-6 sm:mb-8 group hover:-translate-y-1">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xl">🥛</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-blue-700">Current Milk Price</h2>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
                  <span className="text-3xl sm:text-4xl font-bold text-amber-600 mb-2 sm:mb-0">
                    ₹{currentPrices.current.pricePerLiter.toFixed(2)}/liter
                  </span>
                  <span className="text-gray-700 font-medium">
                    Effective from: {new Date(currentPrices.current.effectiveFrom).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 max-w-md">
                <div className="flex items-center text-blue-700">
                  <span className="text-lg mr-2">💡</span>
                  <span className="text-sm font-medium">
                    Sales are automatically calculated when you add milk data
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Milk Price Management */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 border-emerald-600 mb-6 sm:mb-8 group hover:-translate-y-1">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-lg mb-3">
                <span className="text-xl">📊</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-blue-700">Update Milk Price</h2>
              <p className="text-gray-600 mt-2">Set new pricing and recalculate sales automatically</p>
            </div>
            
            <form onSubmit={applyPrice} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-bold text-blue-700 mb-2">
                    📅 Effective Date *
                  </label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    value={priceDate} 
                    onChange={(e) => setPriceDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-blue-700 mb-2">
                    💰 Price per Liter (₹) *
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    value={priceValue} 
                    onChange={(e) => setPriceValue(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-700 mb-2">
                  🔄 Recalculate Sales For
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  value={priceScope}
                  onChange={(e) => setPriceScope(e.target.value as PriceScope)}
                >
                  <option value="prev15">Previous 15 days</option>
                  <option value="next15">Next 15 days</option>
                  <option value="fromDate">From this date onward</option>
                </select>
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <span className="mr-1">ℹ️</span>
                  This will recalculate sales based on actual milk data and new price
                </p>
              </div>

              <button 
                disabled={priceLoading || Number(priceValue) <= 0}
                className="w-full bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700 text-white px-6 py-4 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {priceLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-base sm:text-lg">🐄 Updating Price...</span>
                  </span>
                ) : (
                  <span className="text-base sm:text-lg">💰 Update Price & Recalculate</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Price History */}
        {currentPrices.history.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 border-blue-700 mb-6 sm:mb-8 group hover:-translate-y-1">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-xl">📈</span>
              </div>
              <h2 className="text-xl font-bold text-blue-700">Recent Price Changes</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-emerald-50">
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider rounded-tl-lg">
                      📅 Effective Date
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider rounded-tr-lg">
                      💰 Price per Liter
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentPrices.history.slice(0, 5).map((price, index) => (
                    <tr key={price._id} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(price.effectiveFrom).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-800">
                          ₹{price.pricePerLiter.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sales History */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-emerald-600 overflow-hidden group hover:-translate-y-1">
          <div className="px-4 sm:px-6 py-4 sm:py-6 bg-gradient-to-r from-emerald-50 to-blue-50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-blue-700">Sales History</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Daily sales records ({history.length} entries) - Automatically calculated from milk data
                </p>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 animate-pulse">
                <span className="text-2xl">🐄</span>
              </div>
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-700 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading sales history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="text-6xl sm:text-8xl mb-6">📊</div>
              <h3 className="text-xl font-bold text-blue-700 mb-3">No sales records yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start by adding milk data - sales will be calculated automatically based on your pricing!
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
                <span className="text-lg mr-2">💡</span>
                <span className="text-sm font-medium text-blue-700">Add milk records to see sales data here</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-emerald-50">
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                      📅 Date
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                      🥛 Milk Income
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                      💸 Expenses
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                      📈 Net Profit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((r, index) => (
                    <tr key={r._id} className="hover:bg-gradient-to-r hover:from-blue-25 hover:to-emerald-25 transition-all duration-200">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(r.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 mb-1 sm:mb-0">
                            ₹{r.milkIncome?.toFixed(2) || '0.00'}
                          </span>
                          {r.milkIncome > 0 && (
                            <span className="text-xs text-green-600 font-medium sm:ml-2 bg-green-50 px-2 py-1 rounded">
                              auto-calculated
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800">
                          ₹{r.expense?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          (r.profitLoss || 0) >= 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(r.profitLoss || 0) >= 0 ? '📈' : '📉'} ₹{r.profitLoss?.toFixed(2) || '0.00'}
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
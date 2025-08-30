"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

// Types
type FinanceRow = { date: string; milkIncome: number; expense: number };
type MilkRow = { date: string; liters: number };
type FinanceHistoryRow = { date: string; milkIncome?: number; expense?: number };
type MilkSummaryRow = { date: string; liters: number };

export default function ReportsPage() {
  const { token } = useAuth();
  const [finance, setFinance] = useState<FinanceRow[]>([]);
  const [milk, setMilk] = useState<MilkRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const loadData = async () => {
      try {
        const [financeData, milkData] = await Promise.all([
          apiFetch<FinanceHistoryRow[]>("/finance/history"),
          apiFetch<MilkSummaryRow[]>("/milk/summary"),
        ]);
        setFinance(
          financeData.map((r) => ({
            date: new Date(r.date).toLocaleDateString(),
            milkIncome: r.milkIncome || 0,
            expense: r.expense || 0,
          }))
        );
        setMilk(
          milkData.map((r) => ({
            date: new Date(r.date).toLocaleDateString(),
            liters: r.liters,
          }))
        );
      } catch (error) {
        console.error("Failed to load report data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  // Filter finance data for last 15 days
  const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
  const today = new Date();
  // Date string is in local format; parse
  const financeLast15Days = finance.filter((row) => {
  const rowDate = new Date(row.date);
  return today.getTime() - rowDate.getTime() <= FIFTEEN_DAYS_MS && today.getTime() >= rowDate.getTime();
});


  // Update summary metrics for filtered data
  const totalIncome = financeLast15Days.reduce((sum, f) => sum + f.milkIncome, 0);
  const totalExpenses = financeLast15Days.reduce((sum, f) => sum + f.expense, 0);
  const netProfit = totalIncome - totalExpenses;
  const totalMilkLiters = milk.reduce((sum, m) => sum + m.liters, 0);

  if (!token)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-6xl mb-6">📊</div>
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Access Required</h2>
          <p className="text-gray-600 mb-6">Please login to access reports and analytics</p>
          <a
            href="/login"
            className="bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center"
          >
            <span className="mr-2">🔐</span>
            Go to Login
          </a>
        </div>
      </div>
    );

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-700 absolute top-0 left-0"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
            </div>
          </div>
          <h3 className="text-lg font-medium text-blue-700 mb-2">Loading Reports</h3>
          <p className="text-gray-600">Analyzing your dairy data...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-700 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-xl">📈</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">Reports & Analytics</h1>
              <p className="text-gray-600 text-sm sm:text-base">Data-driven insights for your dairy operations</p>
            </div>
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 border-l-blue-700 group hover:-translate-y-1">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-blue-700 text-xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data Points</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {financeLast15Days.length + milk.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 border-l-emerald-600 group hover:-translate-y-1">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-emerald-600 text-xl">🥛</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Milk (L)</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalMilkLiters.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 border-l-amber-600 group hover:-translate-y-1">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-amber-600 text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Income</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{totalIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 border-l-green-600 group hover:-translate-y-1">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-green-600 text-xl">📈</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Net Profit</p>
                <p
                  className={`text-xl sm:text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ₹{netProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-6 lg:space-y-8">
          {/* Milk Yield Trend */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 border-l-emerald-600 group">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-emerald-600 text-xl">🥛</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-blue-700">Milk Yield Trend</h2>
                <p className="text-gray-500 text-sm">Daily milk production performance</p>
              </div>
            </div>

            {milk.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🥛</span>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No milk data available</h3>
                <p className="text-gray-500 text-sm">Start recording milk production to see trends</p>
                <button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Add Milk Record
                </button>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={milk} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      label={{
                        value: "Liters",
                        angle: -90,
                        position: "insideLeft",
                        fontSize: 11,
                        style: { textAnchor: "middle" },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        fontSize: "14px",
                      }}
                      formatter={(value: number) => [`${value} L`, "Milk Production"]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="liters"
                      stroke="#059669"
                      strokeWidth={3}
                      dot={{ fill: "#059669", strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, stroke: "#059669", strokeWidth: 2, fill: "#ffffff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Income vs Expenses - Filtering table but chart uses all */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 border-l-amber-600 group">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-amber-600 text-xl">💰</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-blue-700">Income vs Expenses</h2>
                <p className="text-gray-500 text-sm">Financial performance comparison</p>
              </div>
            </div>

            {finance.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">💰</span>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No financial data available</h3>
                <p className="text-gray-500 text-sm">Start recording sales and expenses to see financial trends</p>
                <button className="mt-4 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Add Financial Record
                </button>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financeLast15Days} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      label={{
                        value: "Amount (₹)",
                        angle: -90,
                        position: "insideLeft",
                        fontSize: 11,
                        style: { textAnchor: "middle" },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        fontSize: "14px",
                      }}
                      formatter={(value: number, name: string) => [
                        `₹${value.toLocaleString()}`,
                        name === "milkIncome" ? "Income" : "Expenses",
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
                    <Bar dataKey="milkIncome" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Financial Data Table - last 15 days only */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-700 group">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-700 text-xl">📋</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-blue-700">Financial Summary</h2>
                    <p className="text-gray-500 text-sm">
                      Recent {financeLast15Days.length} records (last 15 days)
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Income</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Expenses</span>
                  </div>
                </div>
              </div>
            </div>

            {financeLast15Days.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No financial records</h3>
                <p className="text-gray-500 text-sm">Add income and expense records to see financial summary</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Income
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expenses
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Profit
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {financeLast15Days.map((row, index) => {
                      const netAmount = row.milkIncome - row.expense;
                      const isProfit = netAmount >= 0;

                      return (
                        <tr key={index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {row.date}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ₹{row.milkIncome.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ₹{row.expense.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                isProfit ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              ₹{netAmount.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                isProfit ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {isProfit ? "📈 Profit" : "📉 Loss"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

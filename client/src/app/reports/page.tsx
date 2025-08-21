"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

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
          apiFetch<MilkSummaryRow[]>("/milk/summary")
        ]);
        
        setFinance(financeData.map((r) => ({ 
          date: new Date(r.date).toLocaleDateString(), 
          milkIncome: r.milkIncome || 0, 
          expense: r.expense || 0 
        })));
        
        setMilk(milkData.map((r) => ({ 
          date: new Date(r.date).toLocaleDateString(), 
          liters: r.liters 
        })));
      } catch (error) {
        console.error("Failed to load report data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

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

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading reports...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Data-driven insights for your dairy operations</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Data Points</p>
                <p className="text-2xl font-bold text-gray-900">{finance.length + milk.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-green-600 text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Financial Records</p>
                <p className="text-2xl font-bold text-gray-900">{finance.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-purple-600 text-xl">🥛</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Milk Records</p>
                <p className="text-2xl font-bold text-gray-900">{milk.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-8">
          {/* Milk Yield Trend */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Milk Yield Trend</h2>
              <p className="text-gray-600">Daily milk production over time</p>
            </div>
            
            {milk.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🥛</div>
                <p className="text-gray-500 text-lg">No milk data available</p>
                <p className="text-gray-400 text-sm">Start recording milk production to see trends</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={milk} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      label={{ value: 'Liters', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="liters" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Income vs Expenses */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Income vs Expenses</h2>
              <p className="text-gray-600">Financial performance over time</p>
            </div>
            
            {finance.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">💰</div>
                <p className="text-gray-500 text-lg">No financial data available</p>
                <p className="text-gray-400 text-sm">Start recording sales and expenses to see financial trends</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={finance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: number) => [`₹${value.toFixed(2)}`, '']}
                    />
                    <Legend />
                    <Bar 
                      dataKey="milkIncome" 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]}
                      name="Income"
                    />
                    <Bar 
                      dataKey="expense" 
                      fill="#ef4444" 
                      radius={[4, 4, 0, 0]}
                      name="Expenses"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Financial Data</h2>
              <p className="text-sm text-gray-600 mt-1">Latest {Math.min(finance.length, 10)} records</p>
            </div>
            
            {finance.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No financial records to display</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {finance.slice(0, 10).map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-green-600 font-medium">₹{row.milkIncome.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-red-600 font-medium">₹{row.expense.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-medium ${(row.milkIncome - row.expense) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{(row.milkIncome - row.expense).toFixed(2)}
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
    </div>
  );
}



"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type DisplaySummary = { 
  todayMilk: number; 
  todaySales: number; 
  monthProfit: number;
  monthMilk: number;
  monthRevenue: number;
};
type ApiSummary = { 
  today: { milkCollected: number; milkIncome: number; expense: number; profitLoss: number };
  month?: { income: number; expense: number; profitLoss: number; milkCollected?: number };
};
type Reminder = { id: string; cowId: string; cowName: string; expectedCalvingDate: string };

function Card({ title, value, icon, color, children }: { title: string; value: string | number; icon: string; color: string; children?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<DisplaySummary | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    
    const loadData = async () => {
      try {
        const [apiSummary, remindersData] = await Promise.all([
          apiFetch<ApiSummary>("/finance/summary"),
          apiFetch<Reminder[]>("/breeding/reminders")
        ]);
        const mapped: DisplaySummary = {
          todayMilk: apiSummary?.today?.milkCollected ?? 0,
          todaySales: apiSummary?.today?.milkIncome ?? 0,
          monthProfit: apiSummary?.month?.profitLoss ?? 0,
          monthMilk: apiSummary?.month?.milkCollected ?? 0,
          monthRevenue: apiSummary?.month?.income ?? 0,
        };
        setSummary(mapped);
        setReminders(remindersData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
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
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🐄 Welcome to Gosiri</h1>
          <p className="text-xl text-gray-600">Your Smart Dairy Management Dashboard</p>
        </div>

        {/* Quick Actions on Top */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <a href="/milk" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-center group">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl">🥛</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Record Milk</h3>
            <p className="text-sm text-gray-600">Add today's milk production</p>
          </a>
          
          <a href="/sales" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-center group">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl">💰</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Record Sales</h3>
            <p className="text-sm text-gray-600">Add milk sales data</p>
          </a>
          
          <a href="/expenses" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-center group">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Add Expenses</h3>
            <p className="text-sm text-gray-600">Record farm expenses</p>
          </a>
          
          <a href="/cows" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-center group">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl">🐄</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Manage Cows</h3>
            <p className="text-sm text-gray-600">Add or view herd details</p>
          </a>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card 
            title="Today's Milk Collected" 
            value={`${summary?.todayMilk || 0} L`} 
            icon="🥛" 
            color="#10b981"
          >
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <img src="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=32&h=32&fit=crop&crop=center" 
                     alt="Milk jug" 
                     className="w-6 h-6 rounded object-cover" />
                <span className="text-xs text-green-700">Fresh from your herd</span>
              </div>
            </div>
          </Card>
          
          <Card 
            title="Today's Sales" 
            value={`₹${summary?.todaySales || 0}`} 
            icon="💰" 
            color="#3b82f6"
          >
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=32&h=32&fit=crop&crop=center" 
                     alt="Money" 
                     className="w-6 h-6 rounded object-cover" />
                <span className="text-xs text-blue-700">Revenue generated today</span>
              </div>
            </div>
          </Card>
          
          <Card 
            title="This Month's Milk" 
            value={`${summary?.monthMilk || 0} L`} 
            icon="🐄" 
            color="#8b5cf6"
          >
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <img src="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=32&h=32&fit=crop&crop=center" 
                     alt="Monthly milk" 
                     className="w-6 h-6 rounded object-cover" />
                <span className="text-xs text-purple-700">Total monthly production</span>
              </div>
            </div>
          </Card>
          
          <Card 
            title="This Month's Revenue" 
            value={`₹${summary?.monthRevenue || 0}`} 
            icon="📈" 
            color="#f59e0b"
          >
            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=32&h=32&fit=crop&crop=center" 
                     alt="Monthly revenue" 
                     className="w-6 h-6 rounded object-cover" />
                <span className="text-xs text-amber-700">Total monthly income</span>
              </div>
            </div>
          </Card>
          
          <Card 
            title="This Month's Profit/Loss" 
            value={`₹${summary?.monthProfit || 0}`} 
            icon="📊" 
            color={summary && summary.monthProfit >= 0 ? "#10b981" : "#ef4444"}
          >
            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: summary && summary.monthProfit >= 0 ? '#f0fdf4' : '#fef2f2' }}>
              <div className="flex items-center space-x-2">
                <img src={summary && summary.monthProfit >= 0 
                  ? "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=32&h=32&fit=crop&crop=center"
                  : "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=32&h=32&fit=crop&crop=center"
                } 
                     alt="Chart" 
                     className="w-6 h-6 rounded object-cover" />
                <span className={`text-xs ${summary && summary.monthProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {summary && summary.monthProfit >= 0 ? 'Profitable month' : 'Loss this month'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Calving Reminders */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">🐣 Upcoming Calving Reminders</h2>
            <p className="text-sm text-gray-600 mt-1">Stay prepared for new arrivals</p>
          </div>
          
          {reminders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No calving reminders</h3>
              <p className="text-gray-500">Add breeding records to track calving dates</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reminders.slice(0, 5).map((r) => (
                <div key={r.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-lg">🐄</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{r.cowName}</h3>
                      <p className="text-sm text-gray-500">
                        Expected calving: {new Date(r.expectedCalvingDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {Math.ceil((new Date(r.expectedCalvingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {reminders.length > 5 && (
            <div className="px-6 py-3 bg-gray-50 text-center">
              <a href="/breeding" className="text-sm text-green-600 hover:text-green-700 font-medium">
                View all {reminders.length} reminders →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



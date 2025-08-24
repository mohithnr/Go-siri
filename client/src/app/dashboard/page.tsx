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

function Card({ title, value, icon, color, bgColor, textColor, children }: { 
  title: string; 
  value: string | number; 
  icon: string; 
  color: string;
  bgColor: string;
  textColor: string;
  children?: React.ReactNode 
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 group hover:-translate-y-1" style={{ borderLeftColor: color }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${bgColor}`}>
            <span className="text-xl sm:text-2xl">{icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</h3>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate break-all">{value}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🔐</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h2>
        <p className="text-gray-600 mb-6">Please login to access your dairy dashboard</p>
        <a href="/login" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2">
          <span>Go to Login</span>
          <span>→</span>
        </a>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-700 mx-auto mb-6"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🐄</span>
          </div>
        </div>
        <p className="text-lg font-medium text-gray-900 mb-2">Loading Dashboard</p>
        <p className="text-gray-600">Fetching your dairy data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-2xl text-white">🐄</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Gosiri Dashboard</h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">Smart Dairy Management at Your Fingertips</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <a href="/milk" className="bg-white rounded-xl shadow-lg hover:shadow-xl p-4 sm:p-6 transition-all duration-300 text-center group hover:-translate-y-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl sm:text-3xl">🥛</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Record Milk</h3>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Add production data</p>
          </a>
          
          <a href="/sales" className="bg-white rounded-xl shadow-lg hover:shadow-xl p-4 sm:p-6 transition-all duration-300 text-center group hover:-translate-y-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl sm:text-3xl">💰</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Record Sales</h3>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Track revenue</p>
          </a>
          
          <a href="/expenses" className="bg-white rounded-xl shadow-lg hover:shadow-xl p-4 sm:p-6 transition-all duration-300 text-center group hover:-translate-y-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl sm:text-3xl">📝</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Add Expenses</h3>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Track costs</p>
          </a>
          
          <a href="/cows" className="bg-white rounded-xl shadow-lg hover:shadow-xl p-4 sm:p-6 transition-all duration-300 text-center group hover:-translate-y-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl sm:text-3xl">🐄</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Manage Cows</h3>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Herd management</p>
          </a>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-8">
          <Card 
            title="Today's Milk" 
            value={`${summary?.todayMilk || 0} L`} 
            icon="🥛" 
            color="#059669"
            bgColor="bg-emerald-100"
            textColor="text-emerald-700"
          >
            <div className="mt-3 p-2 sm:p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-600 rounded-full flex-shrink-0"></div>
                <span className="text-xs text-emerald-700 font-medium">Fresh collection</span>
              </div>
            </div>
          </Card>
          
          <Card 
            title="Today's Sales" 
            value={`₹${summary?.todaySales || 0}`} 
            icon="💰" 
            color="#1d4ed8"
            bgColor="bg-blue-100"
            textColor="text-blue-700"
          >
            <div className="mt-3 p-2 sm:p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-full flex-shrink-0"></div>
                <span className="text-xs text-blue-700 font-medium">Daily revenue</span>
              </div>
            </div>
          </Card>
          
          <Card 
            title="Monthly Milk" 
            value={`${summary?.monthMilk || 0} L`} 
            icon="🐄" 
            color="#059669"
            bgColor="bg-emerald-100"
            textColor="text-emerald-700"
          >
            <div className="mt-3 p-2 sm:p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-600 rounded-full flex-shrink-0"></div>
                <span className="text-xs text-emerald-700 font-medium">Total production</span>
              </div>
            </div>
          </Card>
          
          <Card 
            title="Monthly Revenue" 
            value={`₹${summary?.monthRevenue || 0}`} 
            icon="📈" 
            color="#d97706"
            bgColor="bg-amber-100"
            textColor="text-amber-700"
          >
            <div className="mt-3 p-2 sm:p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-amber-600 rounded-full flex-shrink-0"></div>
                <span className="text-xs text-amber-700 font-medium">Total income</span>
              </div>
            </div>
          </Card>
          
          <Card 
            title="Monthly Profit" 
            value={`₹${summary?.monthProfit ? Math.round(summary.monthProfit * 100) / 100 : 0}`} 
            icon="📊" 
            color={summary && summary.monthProfit >= 0 ? "#059669" : "#dc2626"}
            bgColor={summary && summary.monthProfit >= 0 ? "bg-green-100" : "bg-red-100"}
            textColor={summary && summary.monthProfit >= 0 ? "text-green-700" : "text-red-700"}
          >
            <div className={`mt-3 p-2 sm:p-3 rounded-lg ${summary && summary.monthProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex-shrink-0 ${summary && summary.monthProfit >= 0 ? 'bg-green-600' : 'bg-red-600'}`}></div>
                <span className={`text-xs font-medium ${summary && summary.monthProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {summary && summary.monthProfit >= 0 ? 'Profitable' : 'Loss'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Calving Reminders */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-yellow-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">🐣</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Upcoming Calving Reminders</h2>
                <p className="text-sm text-gray-600">Stay prepared for new arrivals</p>
              </div>
            </div>
          </div>
          
          {reminders.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🐄</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming calvings</h3>
              <p className="text-gray-500 mb-4">Add breeding records to track calving dates</p>
              <a href="/breeding" className="inline-flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <span>Add Breeding Record</span>
                <span>→</span>
              </a>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reminders.slice(0, 5).map((r) => (
                <div key={r.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-600 text-lg">🐄</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{r.cowName}</h3>
                        <p className="text-sm text-gray-500 truncate">
                          Due: {new Date(r.expectedCalvingDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {Math.ceil((new Date(r.expectedCalvingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {reminders.length > 5 && (
            <div className="px-4 sm:px-6 py-3 bg-gray-50 text-center">
              <a href="/breeding" className="text-sm text-blue-700 hover:text-blue-800 font-medium inline-flex items-center space-x-1">
                <span>View all {reminders.length} reminders</span>
                <span>→</span>
              </a>
            </div>
          )}
        </div>

        {/* AI Assistant Section */}
        <div className="bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-6 sm:py-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl">🤖</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-white">AI Farming Assistant</h2>
              <p className="text-white text-opacity-90 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                Get expert farming advice 24/7. Ask questions about cow health, breeding, nutrition, and more in your preferred language.
              </p>
              
              <div className="grid sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
                <div className="bg-white bg-opacity-15 backdrop-blur-sm p-4 rounded-lg border border-white border-opacity-30">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-25 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg sm:text-xl">🌍</span>
                  </div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base text-black ">Multi-Language</h3>
                  <p className="text-xs sm:text-sm text-black text-opacity-80">Hindi, Telugu, Tamil & more</p>
                </div>
                
                <div className="bg-white bg-opacity-15 backdrop-blur-sm p-4 rounded-lg border border-white border-opacity-30">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-25 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg sm:text-xl">🐄</span>
                  </div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base text-black">Expert Advice</h3>
                  <p className="text-xs sm:text-sm text-black text-opacity-80">Health, breeding & nutrition</p>
                </div>
                
                <div className="bg-white bg-opacity-15 backdrop-blur-sm p-4 rounded-lg border border-white border-opacity-30">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-25 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg sm:text-xl">⚡</span>
                  </div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base text-black">24/7 Available</h3>
                  <p className="text-xs sm:text-sm text-black text-opacity-80">Instant help anytime</p>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-15 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-white border-opacity-30 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <div className="w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-sm font-bold">💬</span>
                  </div>
                  <span className="font-semibold text-sm sm:text-base text-black">Chat Assistant Ready</span>
                </div>
                <p className="text-xs sm:text-sm text-black text-opacity-90 leading-relaxed">
                  Look for the chat button in the bottom-right corner on any page
                </p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
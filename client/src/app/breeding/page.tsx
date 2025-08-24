"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Cow = { _id: string; name: string; tag?: string };
type Reminder = { id: string; cowId: string; cowName: string; expectedCalvingDate: string; daysUntil: number };
type BreedingRecord = {
  id: string;
  cowId: string;
  cowName: string;
  inseminationDate: string;
  expectedCalvingDate: string;
  actualCalvingDate?: string;
  calfCount?: number;
  status: string;
};

export default function BreedingPage() {
  const { token } = useAuth();
  const [cows, setCows] = useState<Cow[]>([]);
  const [cowId, setCowId] = useState<string>("");
  const [inseminationDate, setInseminationDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [breedingHistory, setBreedingHistory] = useState<BreedingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Calving completion form state
  const [selectedBreedingId, setSelectedBreedingId] = useState<string>("");
  const [actualCalvingDate, setActualCalvingDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [calfCount, setCalfCount] = useState<number>(1);

  useEffect(() => { 
    if (token) {
      loadCows();
      loadReminders();
      loadBreedingHistory();
    }
  }, [token]);

  async function loadCows() {
    try {
      const cowsData = await apiFetch<Cow[]>("/cows/list");
      setCows(cowsData);
    } catch (error) {
      console.error("Failed to load cows:", error);
      setMessage({ type: 'error', text: 'Failed to load cows. Please try again.' });
    }
  }

  async function loadReminders() {
    try {
      const list = await apiFetch<Reminder[]>("/breeding/reminders");
      // Calculate days until calving
      const remindersWithDays = list.map(r => ({
        ...r,
        daysUntil: Math.ceil((new Date(r.expectedCalvingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      }));
      setReminders(remindersWithDays);
    } catch (error) {
      console.error("Failed to load reminders:", error);
      setMessage({ type: 'error', text: 'Failed to load reminders. Please try again.' });
    }
  }

  async function loadBreedingHistory() {
    try {
      const history = await apiFetch<BreedingRecord[]>("/breeding/history");
      setBreedingHistory(history);
    } catch (error) {
      console.error("Failed to load breeding history:", error);
      setMessage({ type: 'error', text: 'Failed to load breeding history. Please try again.' });
    }
  }

  async function addBreeding(e: React.FormEvent) {
    e.preventDefault();
    if (!cowId) {
      setMessage({ type: 'error', text: 'Please select a cow' });
      return;
    }
    
    if (!inseminationDate) {
      setMessage({ type: 'error', text: 'Please select an insemination date' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      console.log('Submitting breeding record:', { cowId, inseminationDate });
      
      const response = await apiFetch("/breeding/add", { 
        method: "POST", 
        body: JSON.stringify({ cowId, inseminationDate }) 
      });
      
      console.log('Breeding record added successfully:', response);
      
      setMessage({ type: 'success', text: 'Insemination record added successfully!' });
      setCowId("");
      setInseminationDate(new Date().toISOString().slice(0, 10));
      await loadReminders();
      await loadBreedingHistory();
    } catch (error) {
      console.error("Failed to add breeding record:", error);
      setMessage({ 
        type: 'error', 
        text: `Failed to add insemination record: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setLoading(false);
    }
  }

  async function markCalvingComplete(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBreedingId) {
      setMessage({ type: 'error', text: 'Please select a breeding record' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await apiFetch("/breeding/calving", { 
        method: "POST", 
        body: JSON.stringify({ 
          breedingId: selectedBreedingId,
          actualCalvingDate,
          calfCount 
        }) 
      });
      
      setMessage({ type: 'success', text: 'Calving marked as completed successfully!' });
      setSelectedBreedingId("");
      setActualCalvingDate(new Date().toISOString().slice(0, 10));
      setCalfCount(1);
      await loadReminders();
      await loadBreedingHistory();
    } catch (error) {
      console.error("Failed to mark calving complete:", error);
      setMessage({ 
        type: 'error', 
        text: `Failed to mark calving complete: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setLoading(false);
    }
  }

  function getDaysUntilText(days: number): string {
    if (days < 0) return "Overdue";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days <= 7) return `${days} days`;
    if (days <= 30) return `${Math.ceil(days / 7)} weeks`;
    return `${Math.ceil(days / 30)} months`;
  }

  function getPriorityColor(days: number): string {
    if (days < 0) return "bg-red-100 text-red-600 border-red-200";
    if (days <= 7) return "bg-yellow-100 text-yellow-600 border-yellow-200";
    if (days <= 30) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-green-100 text-green-600 border-green-200";
  }

  if (!token) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-6xl mb-6">🐄</div>
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Access Required</h2>
        <p className="text-gray-600 mb-6">Please login to access the breeding management system</p>
        <a href="/login" 
           className="bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center">
          <span className="mr-2">🔐</span>
          Go to Login
        </a>
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
              <span className="text-white text-xl">🐣</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">Breeding Management</h1>
              <p className="text-gray-600 text-sm sm:text-base">Track insemination dates and calving reminders</p>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border-l-green-500 border-green-200 text-green-700' 
              : 'bg-red-50 border-l-red-500 border-red-200 text-red-700'
          } shadow-md`}>
            <div className="flex items-center">
              <span className="mr-2">
                {message.type === 'success' ? '✅' : '❌'}
              </span>
              {message.text}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Add Breeding Form */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 border-l-emerald-600 group">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-emerald-600 text-lg">🐄</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-blue-700">Add Insemination Record</h2>
                <p className="text-gray-500 text-sm">Record new breeding activity</p>
              </div>
            </div>
            
            <form onSubmit={addBreeding} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Cow *</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900"
                  value={cowId} 
                  onChange={(e) => setCowId(e.target.value)}
                  required
                >
                  <option value="">Choose a cow...</option>
                  {cows.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.tag ? `(${c.tag})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Insemination Date *</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900"
                  value={inseminationDate} 
                  onChange={(e) => setInseminationDate(e.target.value)}
                  required
                />
              </div>
              
              <button 
                disabled={loading || !cowId || !inseminationDate}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  <>
                    <span className="mr-2">➕</span>
                    Add Insemination Record
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Mark Calving Complete Form */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 border-l-amber-600 group">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <span className="text-amber-600 text-lg">🐣</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-blue-700">Mark Calving Complete</h2>
                <p className="text-gray-500 text-sm">Update completed calvings</p>
              </div>
            </div>
            
            <form onSubmit={markCalvingComplete} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Breeding Record *</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900"
                  value={selectedBreedingId} 
                  onChange={(e) => setSelectedBreedingId(e.target.value)}
                  required
                >
                  <option value="">Choose a breeding record...</option>
                  {breedingHistory.filter(r => r.status === 'Pending').map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.cowName} - {new Date(r.expectedCalvingDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Actual Date *</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900"
                    value={actualCalvingDate} 
                    onChange={(e) => setActualCalvingDate(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calves Count</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900"
                    value={calfCount} 
                    onChange={(e) => setCalfCount(Number(e.target.value))}
                  />
                </div>
              </div>
              
              <button 
                disabled={loading || !selectedBreedingId}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  <>
                    <span className="mr-2">✅</span>
                    Mark Complete
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Calving Reminders */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-yellow-500 group hover:-translate-y-1">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <span className="text-yellow-600 text-xl">🐣</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-blue-700">Upcoming Calvings</h2>
                  <p className="text-gray-500 text-sm">Expected calving dates</p>
                </div>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {reminders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🐄</div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No calving reminders</h3>
                  <p className="text-gray-500 text-sm">Add insemination records to track calving dates</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {reminders.map((r) => (
                    <div key={r.id} className="p-4 sm:p-6 hover:bg-blue-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-emerald-600">🐄</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{r.cowName}</h3>
                            <p className="text-sm text-gray-500">
                              Expected: {new Date(r.expectedCalvingDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(r.daysUntil)}`}>
                            {getDaysUntilText(r.daysUntil)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {r.daysUntil >= 0 ? `${r.daysUntil} days remaining` : `${Math.abs(r.daysUntil)} days overdue`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Breeding History */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-700 group hover:-translate-y-1">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-700 text-xl">📋</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-blue-700">Breeding History</h2>
                  <p className="text-gray-500 text-sm">Complete breeding records</p>
                </div>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {breedingHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No breeding records</h3>
                  <p className="text-gray-500 text-sm">Add insemination records to start tracking</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {breedingHistory.map((record) => (
                    <div key={record.id} className="p-4 sm:p-6 hover:bg-blue-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            record.status === 'Completed' ? 'bg-green-100' : 'bg-amber-100'
                          }`}>
                            <span className={`${
                              record.status === 'Completed' ? 'text-green-600' : 'text-amber-600'
                            }`}>
                              {record.status === 'Completed' ? '✅' : '⏳'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{record.cowName}</h3>
                            <div className="text-sm text-gray-500 space-y-0.5">
                              <p><span className="text-gray-400">Insemination:</span> {new Date(record.inseminationDate).toLocaleDateString()}</p>
                              <p><span className="text-gray-400">Expected:</span> {new Date(record.expectedCalvingDate).toLocaleDateString()}</p>
                              {record.actualCalvingDate && (
                                <p><span className="text-gray-400">Actual:</span> {new Date(record.actualCalvingDate).toLocaleDateString()}</p>
                              )}
                              {record.calfCount && (
                                <p><span className="text-gray-400">Calves:</span> {record.calfCount}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                            record.status === 'Completed' 
                              ? 'bg-green-100 text-green-600 border-green-200' 
                              : 'bg-amber-100 text-amber-600 border-amber-200'
                          }`}>
                            {record.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
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
    if (days < 0) return "bg-red-100 text-red-800";
    if (days <= 7) return "bg-orange-100 text-orange-800";
    if (days <= 30) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Breeding Management</h1>
          <p className="text-gray-600">Track insemination dates and calving reminders</p>
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

        {/* Add Breeding Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Insemination Record</h2>
          <form onSubmit={addBreeding} className="grid md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Cow *</label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900"
                value={inseminationDate} 
                onChange={(e) => setInseminationDate(e.target.value)}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <button 
                disabled={loading || !cowId || !inseminationDate}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  "Add Insemination Record"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Mark Calving Complete Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Mark Calving Complete</h2>
          <form onSubmit={markCalvingComplete} className="grid md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Breeding Record *</label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900"
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actual Calving Date *</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900"
                value={actualCalvingDate} 
                onChange={(e) => setActualCalvingDate(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Calves</label>
              <input 
                type="number" 
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900"
                value={calfCount} 
                onChange={(e) => setCalfCount(Number(e.target.value))}
              />
            </div>
            
            <div>
              <button 
                disabled={loading || !selectedBreedingId}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  "Mark Complete"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Calving Reminders */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">🐣 Upcoming Calving Reminders</h2>
            <p className="text-sm text-gray-600 mt-1">Track expected calving dates for your herd</p>
          </div>
          
          {reminders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No calving reminders</h3>
              <p className="text-gray-500">Add insemination records to track calving dates</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reminders.map((r) => (
                <div key={r.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-lg">🐄</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{r.cowName}</h3>
                        <p className="text-sm text-gray-500">
                          Expected: {new Date(r.expectedCalvingDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(r.daysUntil)}`}>
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

        {/* Breeding History */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">📋 Breeding History</h2>
            <p className="text-sm text-gray-600 mt-1">Complete history of all breeding records</p>
          </div>
          
          {breedingHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No breeding records</h3>
              <p className="text-gray-500">Add insemination records to start tracking</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {breedingHistory.map((record) => (
                <div key={record.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        record.status === 'Completed' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        <span className={`text-lg ${
                          record.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {record.status === 'Completed' ? '✅' : '⏳'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{record.cowName}</h3>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>Insemination: {new Date(record.inseminationDate).toLocaleDateString()}</p>
                          <p>Expected: {new Date(record.expectedCalvingDate).toLocaleDateString()}</p>
                          {record.actualCalvingDate && (
                            <p>Actual: {new Date(record.actualCalvingDate).toLocaleDateString()}</p>
                          )}
                          {record.calfCount && (
                            <p>Calves: {record.calfCount}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        record.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
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
  );
}



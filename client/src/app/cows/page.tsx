"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Cow = { _id: string; name: string; tag?: string; breed?: string; age?: number };

export default function CowsPage() {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState<string>("");
  const [rows, setRows] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const list = await apiFetch<Cow[]>("/cows/list");
    setRows(list);
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      await apiFetch("/cows/add", { 
        method: "POST", 
        body: JSON.stringify({ 
          name: name.trim(), 
          tag: tag.trim() || undefined, 
          breed: breed.trim() || undefined, 
          age: age ? Number(age) : undefined 
        }) 
      });
      setName(""); 
      setTag(""); 
      setBreed(""); 
      setAge("");
      await load();
    } catch (error) {
      console.error("Failed to add cow:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (token) load(); }, [token]);

  if (!token) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-l-4 border-blue-700 text-center max-w-md w-full">
        <div className="text-6xl mb-6">🔐</div>
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please login to access the cow management system</p>
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
              <span className="text-2xl">🐄</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-700 leading-tight">Cow Management</h1>
              <p className="text-sm md:text-base text-gray-600">Add and manage your dairy herd</p>
            </div>
          </div>
        </div>

        {/* Add Cow Form */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border-l-4 border-emerald-600 mb-6 md:mb-8 group">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-emerald-600">➕</span>
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Add New Cow</h2>
          </div>
          
          <form onSubmit={add} className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:items-end">
            <div className="space-y-4 lg:space-y-0 lg:contents">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Cow Name *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Enter cow name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Tag Number
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Tag ID"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Breed Type
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Holstein, Jersey, etc."
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Age (years)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="0.0"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              
              <button
                disabled={loading || !name.trim()}
                className="w-full lg:w-auto bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Adding...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>🐄</span>
                    <span>Add Cow</span>
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Cows List */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-blue-700 group overflow-hidden">
          <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-50 to-emerald-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-700">📊</span>
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-blue-700">Your Dairy Herd</h2>
                  <p className="text-sm text-gray-600">Total livestock: {rows.length} cows</p>
                </div>
              </div>
              <div className="bg-white px-3 py-1 rounded-full shadow-sm">
                <span className="text-2xl font-bold text-amber-600">{rows.length}</span>
              </div>
            </div>
          </div>
          
          {rows.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="text-8xl mb-6">🐄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Cows in Your Herd Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start building your dairy operation by adding your first cow to the management system
              </p>
              <div className="bg-gradient-to-r from-blue-700 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium inline-block shadow-md">
                Use the form above to add your first cow 👆
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              {/* Mobile Card View */}
              <div className="block md:hidden">
                <div className="divide-y divide-gray-200">
                  {rows.map((cow, index) => (
                    <div key={cow._id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-lg">🐄</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{cow.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {cow.tag && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  #{cow.tag}
                                </span>
                              )}
                              {cow.breed && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                  {cow.breed}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {cow.age !== undefined && (
                          <div className="text-right">
                            <div className="text-sm font-medium text-amber-600">{cow.age}</div>
                            <div className="text-xs text-gray-500">years</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        Cow Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        Tag ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        Breed
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        Age
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rows.map((cow, index) => (
                      <tr 
                        key={cow._id} 
                        className={`transition-colors duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                              <span className="text-lg">🐄</span>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{cow.name}</div>
                              <div className="text-xs text-gray-500">Dairy Cow</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {cow.tag ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 shadow-sm">
                              #{cow.tag}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
                              No tag
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {cow.breed ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 shadow-sm">
                              {cow.breed}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">Unknown breed</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {cow.age !== undefined ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold text-amber-600">{cow.age}</span>
                              <span className="text-sm text-gray-500">years</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Age unknown</span>
                          )}
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
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(name, phone, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to register";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-emerald-50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-700 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <span className="text-white font-bold text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300">🐄</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-2">Join Gosiri</h1>
          <p className="text-gray-600 text-sm sm:text-base">Create your dairy management account</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border-l-4 border-emerald-600 group hover:-translate-y-1">
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 border-l-4 border-l-red-600">
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">⚠️</span>
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                👤 Full Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 hover:border-gray-400"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                📱 Phone Number
              </label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 hover:border-gray-400"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                🔐 Password
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 hover:border-gray-400"
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin mr-3">🐄</div>
                  Creating your dairy account...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-2">🚀</span>
                  Create Account
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Already managing your dairy?{" "}
              <a 
                href="/login" 
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 hover:underline"
              >
                Sign in here 🥛
              </a>
            </p>
          </div>

          {/* Professional Features Highlight */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-4">
            <div className="text-center">
              <p className="text-xs text-gray-600 font-medium mb-2">🌟 Professional Dairy Management</p>
              <div className="flex justify-center space-x-4 text-xs text-gray-500">
                <span>📊 Analytics</span>
                <span>🐄 Herd Tracking</span>
                <span>💰 Revenue</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🔒 Your data is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
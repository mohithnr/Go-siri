"use client";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import Chatbot from "./Chatbot";

export default function Nav() {
  const { token, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b-2 border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-xl text-white">🐄</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-blue-700">Gosiri</span>
                  <span className="text-xs text-gray-500 hidden sm:block leading-tight">
                    Smart Dairy Management
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {token ? (
                <>
                  <a href="/dashboard" className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2">
                    <span className="text-lg">📊</span>
                    <span>Dashboard</span>
                  </a>
                  <a href="/cows" className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2">
                    <span className="text-lg">🐄</span>
                    <span>Cows</span>
                  </a>
                  <a href="/milk" className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2">
                    <span className="text-lg">🥛</span>
                    <span>Milk</span>
                  </a>
                  <a href="/sales" className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2">
                    <span className="text-lg">💰</span>
                    <span>Sales</span>
                  </a>
                  <a href="/expenses" className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2">
                    <span className="text-lg">📝</span>
                    <span>Expenses</span>
                  </a>
                  <a href="/breeding" className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2">
                    <span className="text-lg">🐣</span>
                    <span>Breeding</span>
                  </a>
                  <a href="/reports" className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2">
                    <span className="text-lg">📈</span>
                    <span>Reports</span>
                  </a>
                  
                  {/* Divider */}
                  <div className="h-8 w-px bg-gray-300 mx-2"></div>
                  
                  <button
                    onClick={() => document.dispatchEvent(new CustomEvent('openChatbot'))}
                    className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <span className="text-lg">🤖</span>
                    <span>AI Assistant</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <span className="text-lg">🚪</span>
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <a href="/login" className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                    Login
                  </a>
                  <a href="/register" className="bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                    Register
                  </a>
                </>
              )}
            </div>

            {/* Mobile/Tablet Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              {/* AI Assistant Button for Mobile */}
              {token && (
                <button
                  onClick={() => document.dispatchEvent(new CustomEvent('openChatbot'))}
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  title="AI Assistant"
                >
                  <span className="text-lg">🤖</span>
                </button>
              )}
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-4 pt-2 pb-3 space-y-1">
              {token ? (
                <>
                  <a href="/dashboard" 
                     onClick={() => setIsMobileMenuOpen(false)}
                     className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200">
                    <span className="text-xl">📊</span>
                    <span>Dashboard</span>
                  </a>
                  <a href="/cows" 
                     onClick={() => setIsMobileMenuOpen(false)}
                     className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200">
                    <span className="text-xl">🐄</span>
                    <span>Manage Cows</span>
                  </a>
                  <a href="/milk" 
                     onClick={() => setIsMobileMenuOpen(false)}
                     className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200">
                    <span className="text-xl">🥛</span>
                    <span>Milk Records</span>
                  </a>
                  <a href="/sales" 
                     onClick={() => setIsMobileMenuOpen(false)}
                     className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200">
                    <span className="text-xl">💰</span>
                    <span>Sales & Finance</span>
                  </a>
                  <a href="/expenses" 
                     onClick={() => setIsMobileMenuOpen(false)}
                     className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200">
                    <span className="text-xl">📝</span>
                    <span>Expenses</span>
                  </a>
                  <a href="/breeding" 
                     onClick={() => setIsMobileMenuOpen(false)}
                     className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200">
                    <span className="text-xl">🐣</span>
                    <span>Breeding</span>
                  </a>
                  <a href="/reports" 
                     onClick={() => setIsMobileMenuOpen(false)}
                     className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200">
                    <span className="text-xl">📈</span>
                    <span>Reports</span>
                  </a>
                  
                  {/* Divider */}
                  <div className="h-px bg-gray-200 my-2"></div>
                  
                  <button
                    onClick={() => {
                      document.dispatchEvent(new CustomEvent('openChatbot'));
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 shadow-md"
                  >
                    <span className="text-xl">🤖</span>
                    <span>AI Assistant</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 shadow-md"
                  >
                    <span className="text-xl">🚪</span>
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <a href="/login" 
                     onClick={() => setIsMobileMenuOpen(false)}
                     className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200">
                    <span className="text-xl">🔐</span>
                    <span>Login</span>
                  </a>
                  <a href="/register" 
                     onClick={() => setIsMobileMenuOpen(false)}
                     className="bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700 text-white flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 shadow-md">
                    <span className="text-xl">📝</span>
                    <span>Register</span>
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* Chatbot - Only show when user is logged in */}
      {token && <Chatbot />}
    </>
  );
}
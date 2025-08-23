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
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl mr-2">🐄</span>
                <span className="text-xl font-bold text-green-600">Gosiri</span>
              </div>
              <span className="ml-2 text-sm text-gray-500 hidden sm:block">
                Smart Dairy Management
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {token ? (
                <>
                  <a href="/dashboard" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Dashboard
                  </a>
                  <a href="/milk" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Milk Records
                  </a>
                  <a href="/sales" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Sales & Finance
                  </a>
                  <a href="/expenses" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Expenses
                  </a>
                  <a href="/breeding" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Breeding
                  </a>
                  <a href="/reports" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Reports
                  </a>
                  <button
                    onClick={() => document.dispatchEvent(new CustomEvent('openChatbot'))}
                    className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
                  >
                    <span>🤖</span>
                    <span>AI Assistant</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a href="/login" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Login
                  </a>
                  <a href="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                    Register
                  </a>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {token ? (
                <>
                  <a href="/dashboard" className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                    Dashboard
                  </a>
                  <a href="/milk" className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                    Milk Records
                  </a>
                  <a href="/sales" className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                    Sales & Finance
                  </a>
                  <a href="/expenses" className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                    Expenses
                  </a>
                  <a href="/breeding" className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                    Breeding
                  </a>
                  <a href="/reports" className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                    Reports
                  </a>
                  <button
                    onClick={() => document.dispatchEvent(new CustomEvent('openChatbot'))}
                    className="w-full text-left text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium transition-colors"
                  >
                    🤖 AI Assistant
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left bg-red-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a href="/login" className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                    Login
                  </a>
                  <a href="/register" className="bg-green-600 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700 transition-colors">
                    Register
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



"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-emerald-50">
      {/* Hero Section with Background Animation */}
      <div className="relative overflow-hidden min-h-screen">
        {/* Background Image Animation */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <motion.div
            className="flex gap-0 h-full"
            initial={{ z: 0 }}
            animate={{ z: -100 }}
            transition={{ 
              repeat: Infinity, 
              duration: 30, 
              ease: "linear",
              repeatType: "reverse"
            }}
            style={{ width: "100%", transform: "translateZ(0px)" }}
          >
            {/* Images with depth animation */}
            <motion.img
              src="/image1.jpg"
              alt="Dairy Background 1"
              className="absolute inset-0 h-full w-full object-cover"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ 
                repeat: Infinity, 
                duration: 30, 
                ease: "easeInOut",
                times: [0, 0.5, 1]
              }}
            />
            <motion.img
              src="/image2.jpg"
              alt="Dairy Background 2"
              className="absolute inset-0 h-full w-full object-cover"
              animate={{ scale: [1.1, 1, 1.1] }}
              transition={{ 
                repeat: Infinity, 
                duration: 30, 
                ease: "easeInOut",
                times: [0, 0.5, 1],
                delay: 7.5
              }}
            />
            <motion.img
              src="/image3.jpg"
              alt="Dairy Background 3"
              className="absolute inset-0 h-full w-full object-cover opacity-0"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 30, 
                ease: "easeInOut",
                times: [0, 0.5, 1],
                delay: 15
              }}
            />
            <motion.img
              src="/image4.jpg"
              alt="Dairy Background 4"
              className="absolute inset-0 h-full w-full object-cover opacity-0"
              animate={{ 
                scale: [1.1, 1, 1.1],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 30, 
                ease: "easeInOut",
                times: [0, 0.5, 1],
                delay: 22.5
              }}
            />
          </motion.div>
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Hero Content - Centered */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-700 to-emerald-600 rounded-full mb-6 shadow-lg">
                <span className="text-4xl sm:text-5xl">🐄</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                Gosiri
                <span className="block text-2xl md:text-3xl lg:text-4xl text-blue-200 mt-2">
                  Smart Dairy Management System
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                Streamline your dairy operations with intelligent tracking, automated calculations, 
                and comprehensive insights for modern farmers.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                🚀 Get Started Free
              </Link>
              <Link 
                href="/login" 
                className="bg-white text-blue-700 px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-50 transition-colors shadow-md border-2 border-blue-700 hover:border-blue-800"
              >
                📱 Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 border-l-4 border-emerald-600 group">
              <img 
                src="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop&crop=center" 
                alt="Fresh milk production" 
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
              <div className="flex items-center justify-center bg-gradient-to-r from-blue-50 to-emerald-50 px-3 py-2 rounded-lg">
                <span className="text-sm font-semibold text-blue-700">🥛 Fresh Milk Production</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 border-l-4 border-amber-600 group">
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&crop=center" 
                alt="Dairy farm management" 
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
              <div className="flex items-center justify-center bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2 rounded-lg">
                <span className="text-sm font-semibold text-amber-600">💰 Smart Finance</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 border-l-4 border-blue-600 group">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center" 
                alt="Data analytics" 
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
              <div className="flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-lg">
                <span className="text-sm font-semibold text-blue-600">📊 Smart Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-blue-700 mb-4">
              Everything You Need to Manage Your Dairy
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              From milk tracking to financial management, Gosiri has you covered
            </p>
          </div>

          {/* your feature grid unchanged */}
          {/* ... */}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-700 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4 md:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Dairy Management?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of farmers who trust Gosiri to manage their dairy operations efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-white text-blue-700 px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors shadow-md hover:shadow-lg"
            >
              🚀 Start Free Trial
            </Link>
            <Link 
              href="/login" 
              className="bg-transparent text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-white hover:text-blue-700 transition-colors border-2 border-white"
            >
              📱 Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-700 to-emerald-600 rounded-full mb-4 shadow-lg">
              <span className="text-2xl">🐄</span>
            </div>
            <h3 className="text-2xl font-bold text-white">Gosiri</h3>
            <p className="text-gray-400">Smart Dairy Management System</p>
          </div>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400 mb-4">
            <a href="#" className="hover:text-blue-400 transition-colors flex items-center">
              <span className="mr-1">🛡️</span>
              Security
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors flex items-center">
              <span className="mr-1">📞</span>
              Support
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors flex items-center">
              <span className="mr-1">ℹ️</span>
              Help
            </a>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 Gosiri. All rights reserved. Built for modern dairy farmers.
          </p>
        </div>
      </footer>
    </div>
  );
}
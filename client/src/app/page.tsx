import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
                <span className="text-5xl">🐄</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Gosiri
                <span className="block text-3xl md:text-4xl text-green-600 mt-2">
                  Smart Dairy Management System
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Streamline your dairy operations with intelligent tracking, automated calculations, 
                and comprehensive insights for modern farmers.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/register" 
                className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </Link>
              <Link 
                href="/login" 
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg border-2 border-green-600"
              >
                Sign In
              </Link>
            </div>

            {/* Hero Image */}
            <div className="relative max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop&crop=center" 
                    alt="Fresh milk production" 
                    className="w-full h-48 object-cover rounded-xl shadow-lg"
                  />
                  <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 px-3 py-1 rounded-lg">
                    <span className="text-sm font-medium text-gray-800">🥛 Fresh Milk</span>
                  </div>
                </div>
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&crop=center" 
                    alt="Dairy farm management" 
                    className="w-full h-48 object-cover rounded-xl shadow-lg"
                  />
                  <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 px-3 py-1 rounded-lg">
                    <span className="text-sm font-medium text-gray-800">💰 Smart Finance</span>
                  </div>
                </div>
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center" 
                    alt="Data analytics" 
                    className="w-full h-48 object-cover rounded-xl shadow-lg"
                  />
                  <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 px-3 py-1 rounded-lg">
                    <span className="text-sm font-medium text-gray-800">📊 Analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Dairy
            </h2>
            <p className="text-xl text-gray-600">
              From milk tracking to financial management, Gosiri has you covered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🥛</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Milk Production Tracking</h3>
              <p className="text-gray-600">
                Record morning and evening milk production for each cow with automatic daily totals and historical tracking.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Financial Management</h3>
              <p className="text-gray-600">
                Track sales, expenses, and calculate profit/loss automatically. Get insights into your dairy's financial health.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🐄</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Herd Management</h3>
              <p className="text-gray-600">
                Manage individual cow records, track breeding cycles, and get calving reminders for optimal herd health.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Analytics</h3>
              <p className="text-gray-600">
                Visualize milk yield trends, financial performance, and breeding history with interactive charts and reports.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔔</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Reminders</h3>
              <p className="text-gray-600">
                Never miss important dates with automated calving reminders and breeding cycle tracking.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Mobile Friendly</h3>
              <p className="text-gray-600">
                Access your dairy data anywhere, anytime with our responsive web application designed for all devices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Dairy Management?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of farmers who trust Gosiri to manage their dairy operations efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/login" 
              className="bg-transparent text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-green-600 transition-colors border-2 border-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
              <span className="text-2xl">🐄</span>
            </div>
            <h3 className="text-2xl font-bold">Gosiri</h3>
            <p className="text-gray-400">Smart Dairy Management System</p>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 Gosiri. All rights reserved. Built for modern dairy farmers.
          </p>
        </div>
      </footer>
    </div>
  );
}

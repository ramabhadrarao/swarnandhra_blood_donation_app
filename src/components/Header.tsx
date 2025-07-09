import React from 'react';
import { Heart, User, LogOut, Shield, Search, CheckCircle, FileText, Bell } from 'lucide-react';

const Header: React.FC = () => {
  // Mock user state for demonstration
  const user = null; // Change to a user object if logged in

  const handleLogout = () => {
    // Logout logic
    console.log('Logging out...');
  };

  return (
    <header className="bg-white shadow-lg border-b border-red-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
           
            <a href="/" className="flex items-center space-x-2">
            <img 
              src="/logo.png" 
              alt="Swarnandhra Lifeline Logo" 
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Swarnandhra Lifeline</h1>
              <p className="text-sm text-gray-600">Donate Blood, Save Lives</p>
            </div>
          </a>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-700 hover:text-red-500 transition-colors">
              Home
            </a>
            <a href="/search" className="text-gray-700 hover:text-red-500 transition-colors flex items-center">
              <Search className="h-4 w-4 mr-1" />
              Search Donors
            </a>
            <a href="/blood-request" className="text-gray-700 hover:text-red-500 transition-colors">
              Request Blood
            </a>
            {user && (
              <a href="/blood-requests" className="text-gray-700 hover:text-red-500 transition-colors flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Blood Requests
              </a>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors">
                    <Bell className="h-6 w-6" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      3
                    </span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">John Doe</span>
                </div>
                
                {/* Admin Links */}
                <div className="flex items-center space-x-2">
                  <a 
                    href="/admin" 
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </a>
                  <a 
                    href="/admin/verification" 
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify
                  </a>
                  <a 
                    href="/admin/blood-requests" 
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Requests
                  </a>
                </div>
                
                <a 
                  href="/donor-profile" 
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Profile
                </a>
                
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-500 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <a 
                  href="/login" 
                  className="text-gray-700 hover:text-red-500 transition-colors"
                >
                  Login
                </a>
                <a 
                  href="/register" 
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Register
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, User, LogOut, Shield, Search, CheckCircle, FileText } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-lg border-b border-red-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-red-500 rounded-full p-2">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Blood Donation</h1>
              <p className="text-sm text-gray-600">Swarnandhra College</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-red-500 transition-colors">
              Home
            </Link>
            <Link to="/search" className="text-gray-700 hover:text-red-500 transition-colors flex items-center">
              <Search className="h-4 w-4 mr-1" />
              Search Donors
            </Link>
            <Link to="/blood-request" className="text-gray-700 hover:text-red-500 transition-colors">
              Request Blood
            </Link>
            {user && (
              <Link to="/blood-requests" className="text-gray-700 hover:text-red-500 transition-colors flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Blood Requests
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <NotificationBell />
                
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">{user.fullName}</span>
                </div>
                
                {user.role === 'admin' && (
                  <div className="flex items-center space-x-2">
                    <Link 
                      to="/admin" 
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Link>
                    <Link 
                      to="/admin/verification" 
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify
                    </Link>
                    <Link 
                      to="/admin/blood-requests" 
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Requests
                    </Link>
                  </div>
                )}
                
                <Link 
                  to="/donor-profile" 
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Profile
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-500 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-red-500 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
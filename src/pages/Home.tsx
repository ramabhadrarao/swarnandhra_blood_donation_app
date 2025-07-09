import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Users, Search, FileText, Award, Shield } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Save Lives, Donate Blood
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Join Swarnandhra College's Blood Donation Management System
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link 
                  to="/register" 
                  className="bg-white text-red-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Register as Donor
                </Link>
                <Link 
                  to="/search" 
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-500 transition-colors"
                >
                  Find Donors
                </Link>
              </>
            ) : (
              <Link 
                to="/donor-registration" 
                className="bg-white text-red-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Become a Donor
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mb-6 flex items-center justify-center">
            <Users className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Easy Registration</h3>
          <p className="text-gray-600 mb-4">
            Simple registration process for students to become blood donors with document verification.
          </p>
          {user ? (
            <Link 
              to="/donor-registration" 
              className="text-red-500 hover:text-red-600 font-medium"
            >
              Register as Donor →
            </Link>
          ) : (
            <Link 
              to="/register" 
              className="text-red-500 hover:text-red-600 font-medium"
            >
              Get Started →
            </Link>
          )}
        </div>

        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
          <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mb-6 flex items-center justify-center">
            <Search className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Find Donors</h3>
          <p className="text-gray-600 mb-4">
            Search for blood donors by blood group, department, and availability status.
          </p>
          <Link 
            to="/search" 
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Search Now →
          </Link>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
          <div className="bg-green-100 rounded-full p-4 w-16 h-16 mb-6 flex items-center justify-center">
            <FileText className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Blood Requests</h3>
          <p className="text-gray-600 mb-4">
            Submit blood requests with detailed requirements and get connected with donors.
          </p>
          <Link 
            to="/blood-request" 
            className="text-green-500 hover:text-green-600 font-medium"
          >
            Make Request →
          </Link>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold text-center mb-8">Our Impact</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">500+</div>
            <div className="text-gray-600">Lives Saved</div>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">200+</div>
            <div className="text-gray-600">Active Donors</div>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Award className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">300+</div>
            <div className="text-gray-600">Donations</div>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">100%</div>
            <div className="text-gray-600">Safe & Secure</div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
        <p className="text-xl mb-8 opacity-90">
          Join our community of lifesavers and help save lives in your college
        </p>
        {!user ? (
          <Link 
            to="/register" 
            className="bg-white text-blue-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Join Us Today
          </Link>
        ) : (
          <Link 
            to="/donor-profile" 
            className="bg-white text-blue-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Manage Your Profile
          </Link>
        )}
      </section>
    </div>
  );
};

export default Home;
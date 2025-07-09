import React from 'react';
import { Heart, Users, Search, FileText, Award, Shield } from 'lucide-react';

const Home: React.FC = () => {
  // Mock user state for demonstration
  const user = null; // Change to a user object if logged in

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-12 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="Swarnandhra Lifeline Logo" 
              className="h-20 w-20 object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Swarnandhra Lifeline
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Donate Blood, Save Lives
          </p>
          <p className="text-lg md:text-xl mb-8 opacity-80">
            Join Swarnandhra College's Blood Donation Management System
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <a 
                  href="/register" 
                  className="bg-white text-red-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Register as Donor
                </a>
                <a 
                  href="/search" 
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-500 transition-colors"
                >
                  Find Donors
                </a>
              </>
            ) : (
              <a 
                href="/donor-registration" 
                className="bg-white text-red-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Become a Donor
              </a>
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
            Simple registration process for students to become blood donors with document verification and instant approval system.
          </p>
          {user ? (
            <a 
              href="/donor-registration" 
              className="text-red-500 hover:text-red-600 font-medium"
            >
              Register as Donor →
            </a>
          ) : (
            <a 
              href="/register" 
              className="text-red-500 hover:text-red-600 font-medium"
            >
              Get Started →
            </a>
          )}
        </div>

        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
          <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mb-6 flex items-center justify-center">
            <Search className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Find Donors</h3>
          <p className="text-gray-600 mb-4">
            Search for compatible blood donors by blood group, department, availability, and location within your college community.
          </p>
          <a 
            href="/search" 
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Search Now →
          </a>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
          <div className="bg-green-100 rounded-full p-4 w-16 h-16 mb-6 flex items-center justify-center">
            <FileText className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Blood Requests</h3>
          <p className="text-gray-600 mb-4">
            Submit urgent blood requests with detailed requirements and get connected with verified donors in real-time.
          </p>
          <a 
            href="/blood-request" 
            className="text-green-500 hover:text-green-600 font-medium"
          >
            Make Request →
          </a>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-gradient-to-r from-blue-50 to-red-50 rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Swarnandhra Lifeline is dedicated to creating a seamless bridge between blood donors and recipients within our college community. 
          We believe that every donation can save up to three lives, and through our platform, we make it easier than ever to 
          contribute to this noble cause.
        </p>
      </section>

      {/* Statistics Section */}
      <section className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Our Impact</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600">500+</div>
            <div className="text-gray-600">Lives Saved</div>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600">200+</div>
            <div className="text-gray-600">Active Donors</div>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Award className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">300+</div>
            <div className="text-gray-600">Successful Donations</div>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-purple-600">100%</div>
            <div className="text-gray-600">Safe & Secure</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold mb-3">Register</h3>
            <p className="text-gray-600">
              Create your account and register as a blood donor with your medical information and documents.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold mb-3">Get Verified</h3>
            <p className="text-gray-600">
              Our admin team reviews your profile and documents to ensure safety and authenticity.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold mb-3">Save Lives</h3>
            <p className="text-gray-600">
              Receive notifications for compatible blood requests and help save lives in your community.
            </p>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-red-800 mb-4">Emergency Blood Request?</h2>
        <p className="text-red-700 mb-6">
          For urgent blood requirements, contact our emergency helpline or submit a request immediately.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/blood-request" 
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Submit Emergency Request
          </a>
          <a 
            href="tel:+91-9876543210" 
            className="bg-white text-red-500 border-2 border-red-500 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
          >
            Call Emergency Line
          </a>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
        <p className="text-xl mb-8 opacity-90">
          Join Swarnandhra Lifeline today and become part of a life-saving community
        </p>
        {!user ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/register" 
              className="bg-white text-blue-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Join Us Today
            </a>
            <a 
              href="/blood-request" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-500 transition-colors"
            >
              Request Blood
            </a>
          </div>
        ) : (
          <a 
            href="/donor-profile" 
            className="bg-white text-blue-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Manage Your Profile
          </a>
        )}
      </section>
    </div>
  );
};

export default Home;
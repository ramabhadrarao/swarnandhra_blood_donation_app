import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorRegistration from './pages/DonorRegistration';
import DonorProfile from './pages/DonorProfile';
import SearchDonors from './pages/SearchDonors';
import BloodRequest from './pages/BloodRequest';
import BloodRequestsForDonors from './pages/BloodRequestsForDonors';
import AdminDashboard from './pages/AdminDashboard';
import AdminVerification from './pages/AdminVerification';
import AdminBloodRequests from './pages/AdminBloodRequests';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<SearchDonors />} />
              <Route path="/blood-request" element={<BloodRequest />} />
              <Route 
                path="/blood-requests" 
                element={
                  <ProtectedRoute>
                    <BloodRequestsForDonors />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/donor-registration" 
                element={
                  <ProtectedRoute>
                    <DonorRegistration />
                  </ProtectedRoute>
                } 
              />
           <Route 
               path="/donor-profile" 
               element={
                 <ProtectedRoute>
                   <DonorProfile />
                 </ProtectedRoute>
               } 
             />
             <Route 
               path="/admin" 
               element={
                 <ProtectedRoute adminOnly>
                   <AdminDashboard />
                 </ProtectedRoute>
               } 
             />
             <Route 
               path="/admin/verification" 
               element={
                 <ProtectedRoute adminOnly>
                   <AdminVerification />
                 </ProtectedRoute>
               } 
             />
             <Route 
               path="/admin/blood-requests" 
               element={
                 <ProtectedRoute adminOnly>
                   <AdminBloodRequests />
                 </ProtectedRoute>
               } 
             />
           </Routes>
         </main>
       </div>
     </Router>
   </AuthProvider>
 );
}

export default App;
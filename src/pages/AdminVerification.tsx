import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, CheckCircle, XCircle, Eye, FileText, User, Phone, Mail, Download } from 'lucide-react';

interface Donor {
  _id: string;
  bloodGroup: string;
  weight: number;
  availability: string;
  isVerified: boolean;
  totalDonations: number;
  documents: Array<{
    _id: string;
    type: string;
    fileName: string;
    filePath: string;
    uploadedAt: string;
  }>;
  user: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    department: string;
    year: number;
    rollNumber: string;
  };
  createdAt: string;
}

const AdminVerification: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('pending');

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/donors');
      setDonors(response.data.donors);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch donors');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyDonor = async (donorId: string, isVerified: boolean) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/donors/${donorId}/verify`, { isVerified });
      setDonors(donors.map(donor => 
        donor._id === donorId ? { ...donor, isVerified } : donor
      ));
      if (selectedDonor && selectedDonor._id === donorId) {
        setSelectedDonor({ ...selectedDonor, isVerified });
      }
      setError(''); // Clear any previous errors
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update verification status');
    }
  };

  const filteredDonors = donors.filter(donor => {
    if (filter === 'pending') return !donor.isVerified;
    if (filter === 'verified') return donor.isVerified;
    return true;
  });

  const openDocumentViewer = (filePath: string, fileName: string) => {
    // Clean the path and create full URL
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullPath = `http://localhost:5000/${cleanPath}`;
    
    // Try to open in new tab
    const newWindow = window.open(fullPath, '_blank');
    
    // If popup blocked or failed, offer download
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      downloadDocument(filePath, fileName);
    }
  };

  const downloadDocument = (filePath: string, fileName: string) => {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullUrl = `http://localhost:5000/${cleanPath}`;
    
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-full p-3">
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Donor Verification</h1>
              <p className="text-gray-600">Review and verify donor registrations</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button 
            onClick={() => setError('')}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Donors List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            {/* Filter Tabs */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pending ({donors.filter(d => !d.isVerified).length})
              </button>
              <button
                onClick={() => setFilter('verified')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'verified'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Verified ({donors.filter(d => d.isVerified).length})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({donors.length})
              </button>
            </div>

            {/* Donors Grid */}
            <div className="space-y-4">
              {filteredDonors.map((donor) => (
                <div
                  key={donor._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedDonor?._id === donor._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDonor(donor)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-100 rounded-full p-2">
                        <User className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{donor.user.fullName}</h3>
                        <p className="text-sm text-gray-600">{donor.user.rollNumber} • {donor.user.department}</p>
                        <p className="text-sm text-gray-500">Year {donor.user.year} • {donor.bloodGroup}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        donor.isVerified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {donor.isVerified ? 'Verified' : 'Pending'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {donor.documents.length} docs
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {filteredDonors.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No donors found for the selected filter</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Donor Details Panel */}
        <div className="lg:col-span-1">
          {selectedDonor ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-4">
              <div className="space-y-6">
                {/* Donor Info */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Donor Details</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedDonor.isVerified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedDonor.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedDonor.user.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Roll Number</p>
                      <p className="font-medium">{selectedDonor.user.rollNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Blood Group</p>
                      <p className="font-medium text-red-600">{selectedDonor.bloodGroup}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Weight</p>
                      <p className="font-medium">{selectedDonor.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-sm">{selectedDonor.user.email}</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-sm">{selectedDonor.user.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="font-semibold mb-3">Documents ({selectedDonor.documents.length})</h4>
                  {selectedDonor.documents.length === 0 ? (
                    <p className="text-sm text-gray-600">No documents uploaded</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDonor.documents.map((doc) => (
                        <div
                          key={doc._id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">{doc.fileName}</p>
                              <p className="text-xs text-gray-500 capitalize">{doc.type.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                             onClick={() => openDocumentViewer(doc.filePath, doc.fileName)}
                             className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                             title="View Document"
                           >
                             <Eye className="h-4 w-4" />
                           </button>
                           <button
                             onClick={() => downloadDocument(doc.filePath, doc.fileName)}
                             className="text-green-500 hover:text-green-700 p-1 rounded hover:bg-green-50"
                             title="Download Document"
                           >
                             <Download className="h-4 w-4" />
                           </button>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>

               {/* Verification Actions */}
               <div className="space-y-3">
                 {!selectedDonor.isVerified ? (
                   <>
                     <button
                       onClick={() => verifyDonor(selectedDonor._id, true)}
                       className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                     >
                       <CheckCircle className="h-4 w-4 mr-2" />
                       Verify Donor
                     </button>
                     <button
                       onClick={() => verifyDonor(selectedDonor._id, false)}
                       className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                     >
                       <XCircle className="h-4 w-4 mr-2" />
                       Reject
                     </button>
                   </>
                 ) : (
                   <button
                     onClick={() => verifyDonor(selectedDonor._id, false)}
                     className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center"
                   >
                     <XCircle className="h-4 w-4 mr-2" />
                     Revoke Verification
                   </button>
                 )}
               </div>
             </div>
           </div>
         ) : (
           <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
             <div className="text-center py-8">
               <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
               <p className="text-gray-600">Select a donor to view details</p>
             </div>
           </div>
         )}
       </div>
     </div>
   </div>
 );
};

export default AdminVerification;
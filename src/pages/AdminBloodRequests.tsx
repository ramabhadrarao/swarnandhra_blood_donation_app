import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, User, Heart, Phone, Mail, UserPlus, CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react';

interface BloodRequest {
  _id: string;
  patientName: string;
  bloodGroup: string;
  unitsNeeded: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  requiredDate: string;
  hospital: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  reason: string;
  status: 'pending' | 'partial' | 'fulfilled' | 'cancelled';
  assignedDonors: Array<{
    donor: {
      _id: string;
      bloodGroup: string;
      user: {
        fullName: string;
        email: string;
        phone: string;
        department: string;
        year: number;
      };
    };
    assignedAt: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    response?: string;
    proofDocuments?: Array<{
      _id: string;
      fileName: string;
      filePath: string;
      uploadedAt: string;
    }>;
    completedAt?: string;
  }>;
  createdAt: string;
}

interface Donor {
  _id: string;
  bloodGroup: string;
  isVerified: boolean;
  user: {
    fullName: string;
    email: string;
    phone: string;
    department: string;
    year: number;
  };
}

const AdminBloodRequests: React.FC = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchDonors();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/blood-requests');
      setRequests(response.data.requests);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDonors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/donors');
      setDonors(response.data.donors.filter((donor: Donor) => donor.isVerified));
    } catch (err: any) {
      console.error('Failed to fetch donors:', err);
    }
  };

  const assignDonor = async (requestId: string, donorId: string) => {
    setAssigning(true);
    try {
      await axios.post('http://localhost:5000/api/admin/assign-donor', {
        requestId,
        donorId
      });
      
      await fetchRequests();
      setShowAssignModal(false);
      setSelectedRequest(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign donor');
    } finally {
      setAssigning(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/blood-requests/${requestId}/status`, { status });
      await fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'fulfilled': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompatibleDonors = (bloodGroup: string) => {
    return donors.filter(donor => {
      // Blood compatibility logic
      if (bloodGroup === 'AB+') return true; // Universal recipient
      if (bloodGroup === 'AB-') return ['AB-', 'A-', 'B-', 'O-'].includes(donor.bloodGroup);
      if (bloodGroup === 'A+') return ['A+', 'A-', 'O+', 'O-'].includes(donor.bloodGroup);
      if (bloodGroup === 'A-') return ['A-', 'O-'].includes(donor.bloodGroup);
      if (bloodGroup === 'B+') return ['B+', 'B-', 'O+', 'O-'].includes(donor.bloodGroup);
      if (bloodGroup === 'B-') return ['B-', 'O-'].includes(donor.bloodGroup);
      if (bloodGroup === 'O+') return ['O+', 'O-'].includes(donor.bloodGroup);
      if (bloodGroup === 'O-') return donor.bloodGroup === 'O-';
      return false;
    });
  };

  const openDocumentViewer = (filePath: string, fileName: string) => {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullPath = `http://localhost:5000/${cleanPath}`;
    
    const newWindow = window.open(fullPath, '_blank');
    
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
            <div className="bg-red-100 rounded-full p-3">
              <FileText className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Blood Request Management</h1>
              <p className="text-gray-600">Manage and assign blood requests to donors</p>
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

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-6">Blood Requests ({requests.length})</h2>
        
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No blood requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{request.patientName}</h3>
                    <p className="text-gray-600">{request.hospital}</p>
                    <p className="text-sm text-gray-500">
                      Requested: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status.toUpperCase()}
                    </span>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {request.bloodGroup}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Units Needed</p>
                    <p className="font-medium">{request.unitsNeeded}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Required Date</p>
                    <p className="font-medium">{new Date(request.requiredDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="font-medium">{request.contactPerson}</p>
                    <p className="text-sm text-gray-500">{request.contactPhone}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">Reason</p>
                  <p className="text-sm">{request.reason}</p>
                </div>

                {/* Assigned Donors */}
                {request.assignedDonors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Assigned Donors ({request.assignedDonors.length})</h4>
                    <div className="space-y-3">
                      {request.assignedDonors.map((assignment, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <User className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium">{assignment.donor.user.fullName}</p>
                                <p className="text-sm text-gray-600">{assignment.donor.user.phone}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                              {assignment.status}
                            </span>
                          </div>
                          
                          {assignment.response && (
                            <div className="mb-2 p-2 bg-white rounded border">
                              <p className="text-sm">
                                <strong>Response:</strong> {assignment.response}
                              </p>
                            </div>
                          )}
                          
                          {assignment.proofDocuments && assignment.proofDocuments.length > 0 && (
                            <div className="mt-2">
                              <h5 className="text-sm font-medium mb-2">Proof Documents:</h5>
                              <div className="space-y-1">
                                {assignment.proofDocuments.map((doc, docIndex) => (
                                  <div key={docIndex} className="flex items-center justify-between p-2 bg-white rounded border">
                                    <div className="flex items-center space-x-2">
                                      <FileText className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm">{doc.fileName}</span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(doc.uploadedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => openDocumentViewer(doc.filePath, doc.fileName)}
                                        className="text-blue-500 hover:text-blue-700 p-1"
                                        title="View Document"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => downloadDocument(doc.filePath, doc.fileName)}
                                        className="text-green-500 hover:text-green-700 p-1"
                                        title="Download Document"
                                      >
                                        <Download className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {assignment.status === 'completed' && assignment.completedAt && (
                            <div className="mt-2 p-2 bg-green-50 rounded border">
                              <p className="text-sm text-green-700">
                                <strong>Completed:</strong> {new Date(assignment.completedAt).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowAssignModal(true);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Donor
                  </button>
                  
                  {request.status === 'pending' && (
                    <button
                      onClick={() => updateRequestStatus(request._id, 'partial')}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Mark Partial
                    </button>
                  )}
                  
                  <button
                    onClick={() => updateRequestStatus(request._id, 'fulfilled')}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Mark Fulfilled
                  </button>
                  
                  <button
                    onClick={() => updateRequestStatus(request._id, 'cancelled')}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Donor Modal */}
      {showAssignModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Assign Donor to {selectedRequest.patientName}
            </h3>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <strong>Blood Group:</strong> {selectedRequest.bloodGroup} |
                <strong> Units:</strong> {selectedRequest.unitsNeeded} |
                <strong> Urgency:</strong> {selectedRequest.urgency}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {getCompatibleDonors(selectedRequest.bloodGroup).map((donor) => {
                const isAlreadyAssigned = selectedRequest.assignedDonors.some(
                  assignment => assignment.donor._id === donor._id
                );
                
                return (
                  <div 
                    key={donor._id} 
                    className={`border rounded-lg p-4 ${isAlreadyAssigned ? 'opacity-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{donor.user.fullName}</p>
                          <p className="text-sm text-gray-600">
                            {donor.user.department} | Year {donor.user.year}
                          </p>
                          <p className="text-sm text-gray-500">{donor.user.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                          {donor.bloodGroup}
                        </span>
                        {!isAlreadyAssigned ? (
                          <button
                            onClick={() => assignDonor(selectedRequest._id, donor._id)}
                            disabled={assigning}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            {assigning ? 'Assigning...' : 'Assign'}
                          </button>
                        ) : (
                          <span className="text-gray-500 text-sm">Already Assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedRequest(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBloodRequests;
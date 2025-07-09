import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, AlertCircle, Clock, CheckCircle, Phone, Mail, MapPin, Calendar, Upload, FileText, Eye, Download, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    donor: string;
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

const BloodRequestsForDonors: React.FC = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [myRequests, setMyRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDonor, setIsDonor] = useState(false);
  const [donorId, setDonorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'assigned'>('available');
  const [responding, setResponding] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState<string | null>(null);

  useEffect(() => {
    checkDonorStatus();
  }, []);

  useEffect(() => {
    if (isDonor) {
      fetchBloodRequests();
      fetchMyAssignedRequests();
    }
  }, [isDonor]);

  const checkDonorStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/donors/profile');
      setIsDonor(true);
      setDonorId(response.data.donor._id);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setIsDonor(false);
      } else {
        setError('Failed to check donor status');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBloodRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/requests/for-donors');
      setRequests(response.data.requests);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch blood requests');
    }
  };

  const fetchMyAssignedRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/requests/my-assignments');
      setMyRequests(response.data.requests);
    } catch (err: any) {
      console.error('Failed to fetch assigned requests:', err);
    }
  };

  const respondToRequest = async (requestId: string, status: 'accepted' | 'rejected', response?: string) => {
    setResponding(requestId);
    try {
      await axios.post('http://localhost:5000/api/requests/respond', {
        requestId,
        status,
        response
      });
      
      await fetchBloodRequests();
      await fetchMyAssignedRequests();
      setError(''); // Clear any previous errors
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to respond to request');
    } finally {
      setResponding(null);
    }
  };

  const uploadProofDocument = async (requestId: string, file: File) => {
    setUploadingProof(requestId);
    const formData = new FormData();
    formData.append('proof', file);
    formData.append('requestId', requestId);

    try {
      await axios.post('http://localhost:5000/api/requests/upload-proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      await fetchMyAssignedRequests();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload proof document');
    } finally {
      setUploadingProof(null);
    }
  };

  const markAsCompleted = async (requestId: string) => {
    try {
      await axios.post('http://localhost:5000/api/requests/mark-completed', { requestId });
      await fetchMyAssignedRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark as completed');
    }
  };

  const viewDocument = (filePath: string) => {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullUrl = `http://localhost:5000/${cleanPath}`;
    window.open(fullUrl, '_blank');
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isRequestExpired = (requiredDate: string) => {
    return new Date(requiredDate) < new Date();
  };

  const getCurrentUserAssignment = (request: BloodRequest) => {
    return request.assignedDonors.find(assignment => assignment.donor === donorId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!isDonor) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
          <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <UserPlus className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-blue-800 mb-2">Not Registered as Donor</h1>
          <p className="text-blue-700 mb-6">
            You need to register as a blood donor to view and respond to blood requests.
          </p>
          <Link 
            to="/donor-registration"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Register as Donor
          </Link>
        </div>
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
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Blood Requests</h1>
              <p className="text-gray-600">Help save lives by responding to blood requests</p>
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

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('available')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'available'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Available Requests ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('assigned')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assigned'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Assignments ({myRequests.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'available' && (
            <div className="space-y-6">
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No blood requests match your blood group at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div 
                      key={request._id} 
                      className={`border rounded-lg p-6 ${
                        isRequestExpired(request.requiredDate) ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{request.patientName}</h3>
                          <p className="text-gray-600">{request.hospital}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(request.urgency)}`}>
                            {request.urgency.toUpperCase()}
                          </span>
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {request.bloodGroup}
                          </span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Units needed: <strong>{request.unitsNeeded}</strong></span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">
                            Required by: <strong>{new Date(request.requiredDate).toLocaleDateString()}</strong>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{request.contactPerson}: {request.contactPhone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">{request.contactEmail}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          <strong>Reason:</strong> {request.reason}
                        </p>
                      </div>

                      {!isRequestExpired(request.requiredDate) && (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => respondToRequest(request._id, 'accepted')}
                            disabled={responding === request._id}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {responding === request._id ? 'Accepting...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => respondToRequest(request._id, 'rejected', 'Not available at this time')}
                            disabled={responding === request._id}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center"
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Decline
                          </button>
                        </div>
                      )}

                      {isRequestExpired(request.requiredDate) && (
                        <div className="text-red-500 text-sm font-medium">
                          This request has expired
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'assigned' && (
            <div className="space-y-6">
              {myRequests.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">You haven't been assigned to any blood requests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRequests.map((request) => {
                    const myAssignment = getCurrentUserAssignment(request);
                    
                    return (
                      <div key={request._id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{request.patientName}</h3>
                            <p className="text-gray-600">{request.hospital}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(myAssignment?.status || 'pending')}`}>
                              {myAssignment?.status || 'Pending'}
                            </span>
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              {request.bloodGroup}
                            </span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="text-sm">Units needed: <strong>{request.unitsNeeded}</strong></span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">
                              Required by: <strong>{new Date(request.requiredDate).toLocaleDateString()}</strong>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{request.contactPerson}: {request.contactPhone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-purple-500" />
                            <span className="text-sm">{request.contactEmail}</span>
                          </div>
                        </div>

                        {/* Assignment Actions */}
                        {myAssignment?.status === 'pending' && !isRequestExpired(request.requiredDate) && (
                          <div className="flex space-x-3 mb-4">
                            <button
                              onClick={() => respondToRequest(request._id, 'accepted')}
                              disabled={responding === request._id}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                              {responding === request._id ? 'Accepting...' : 'Accept Assignment'}
                            </button>
                            <button
                              onClick={() => respondToRequest(request._id, 'rejected')}
                              disabled={responding === request._id}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              Decline Assignment
                            </button>
                          </div>
                        )}

                        {/* Proof Upload Section for Accepted Assignments */}
                        {myAssignment?.status === 'accepted' && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-green-800 mb-3">Donation Completed?</h4>
                            <p className="text-sm text-green-700 mb-4">
                              After completing your blood donation, please upload proof (donation certificate, receipt, photo) and mark as completed.
                            </p>
                            
                            {/* Proof Documents */}
                            {myAssignment.proofDocuments && myAssignment.proofDocuments.length > 0 && (
                              <div className="mb-4">
                                <h5 className="font-medium text-green-800 mb-2">Uploaded Proof Documents:</h5>
                                <div className="space-y-2">
                                  {myAssignment.proofDocuments.map((doc) => (
                                    <div key={doc._id} className="flex items-center justify-between p-2 bg-white rounded border">
                                      <div className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm font-medium">{doc.fileName}</span>
                                        <span className="text-xs text-gray-500">
                                          {new Date(doc.uploadedAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => viewDocument(doc.filePath)}
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

                            <div className="flex space-x-3">
                              <label className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer flex items-center">
                                <Upload className="h-4 w-4 mr-2" />
                                {uploadingProof === request._id ? 'Uploading...' : 'Upload Proof'}
                                <input
                                  type="file"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadProofDocument(request._id, file);
                                  }}
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  className="hidden"
                                  disabled={uploadingProof === request._id}
                                />
                              </label>
                              
                              <button
                                onClick={() => markAsCompleted(request._id)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Completed
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Completed Status */}
                        {myAssignment?.status === 'completed' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle className="h-5 w-5 text-blue-500" />
                              <h4 className="font-semibold text-blue-800">Donation Completed</h4>
                            </div>
                            <p className="text-sm text-blue-700">
                              Thank you for your blood donation! Completed on: {' '}
                              <strong>{myAssignment.completedAt ? new Date(myAssignment.completedAt).toLocaleDateString() : 'N/A'}</strong>
                            </p>
                            
                            {myAssignment.proofDocuments && myAssignment.proofDocuments.length > 0 && (
                              <div className="mt-3">
                                <h5 className="font-medium text-blue-800 mb-2">Proof Documents:</h5>
                                <div className="space-y-1">
                                  {myAssignment.proofDocuments.map((doc) => (
                                    <div key={doc._id} className="flex items-center justify-between p-2 bg-white rounded border">
                                      <div className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">{doc.fileName}</span>
                                      </div>
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => viewDocument(doc.filePath)}
                                          className="text-blue-500 hover:text-blue-700 p-1"
                                        >
                                          <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() => downloadDocument(doc.filePath, doc.fileName)}
                                          className="text-green-500 hover:text-green-700 p-1"
                                        >
                                          <Download className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {myAssignment?.response && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <strong>Your response:</strong> {myAssignment.response}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BloodRequestsForDonors;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { User, Heart, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface DonorProfile {
  _id: string;
  bloodGroup: string;
  weight: number;
  lastDonationDate: string | null;
  medicalConditions: string[];
  availability: string;
  documents: Array<{
    _id: string;
    type: string;
    fileName: string;
    filePath: string;
    uploadedAt: string;
  }>;
  isVerified: boolean;
  totalDonations: number;
  status: string;
  user: {
    fullName: string;
    email: string;
    phone: string;
    department: string;
    year: number;
  };
}

const DonorProfile: React.FC = () => {
  const [donor, setDonor] = useState<DonorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetchDonorProfile();
  }, []);

  const fetchDonorProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/donors/profile');
      setDonor(response.data.donor);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', 'other');

    try {
      await axios.post('http://localhost:5000/api/upload/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchDonorProfile(); // Refresh profile
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingFile(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/upload/documents/${documentId}`);
      fetchDonorProfile(); // Refresh profile
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete document');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error && !donor) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
        <div className="text-center">
          <p className="text-gray-600 mb-4">You haven't registered as a donor yet.</p>
          <Link 
            to="/donor-registration"
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Register as Donor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-red-100 rounded-full p-4 w-16 h-16 flex items-center justify-center">
              <User className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{donor?.user.fullName}</h1>
              <p className="text-gray-600">{donor?.user.department}, Year {donor?.user.year}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {donor?.isVerified ? (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Verified
              </span>
            ) : (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Pending Verification
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blood Group</p>
                <p className="text-2xl font-bold text-red-600">{donor?.bloodGroup}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Donations</p>
                <p className="text-2xl font-bold text-blue-600">{donor?.totalDonations}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Availability</p>
                <p className="text-lg font-semibold text-green-600 capitalize">{donor?.availability}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{donor?.user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{donor?.user.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Weight</p>
            <p className="font-medium">{donor?.weight} kg</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Donation</p>
            <p className="font-medium">
              {donor?.lastDonationDate 
                ? new Date(donor.lastDonationDate).toLocaleDateString()
                : 'Never donated'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Documents</h2>
          <label className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors cursor-pointer flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            {uploadingFile ? 'Uploading...' : 'Upload Document'}
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              disabled={uploadingFile}
            />
          </label>
        </div>

        {donor?.documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {donor?.documents.map((doc) => (
              <div key={doc._id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="font-medium">{doc.fileName}</p>
                    <p className="text-sm text-gray-600 capitalize">{doc.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteDocument(doc._id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Medical Conditions */}
      {donor?.medicalConditions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-xl font-semibold mb-4">Medical Conditions</h2>
          <div className="flex flex-wrap gap-2">
            {donor.medicalConditions.map((condition, index) => (
              <span
                key={index}
                className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm"
              >
                {condition}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorProfile;
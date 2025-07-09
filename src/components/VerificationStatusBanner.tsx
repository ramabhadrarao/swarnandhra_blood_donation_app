import React from 'react';
import { CheckCircle, Clock, XCircle, Upload, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VerificationStatusBannerProps {
  isVerified: boolean;
  documentsCount: number;
  isDonor: boolean;
}

const VerificationStatusBanner: React.FC<VerificationStatusBannerProps> = ({ 
  isVerified, 
  documentsCount, 
  isDonor 
}) => {
  if (!isDonor) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-blue-500 mr-3" />
          <div>
            <h3 className="text-blue-800 font-semibold">Not Registered as Donor</h3>
            <p className="text-blue-700 text-sm">
              Register as a donor to help save lives in your college community.
            </p>
          </div>
          <Link 
            to="/donor-registration"
            className="ml-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Register Now
          </Link>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
          <div>
            <h3 className="text-green-800 font-semibold">Verified Donor</h3>
            <p className="text-green-700 text-sm">
              Your donor profile has been verified by our admin team. You can now be contacted for blood donations.
            </p>
          </div>
          <span className="ml-auto bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            ✓ Verified
          </span>
        </div>
      </div>
    );
  }

  if (documentsCount === 0) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Upload className="h-5 w-5 text-orange-500 mr-3" />
          <div>
            <h3 className="text-orange-800 font-semibold">Upload Documents Required</h3>
            <p className="text-orange-700 text-sm">
              Please upload your documents (ID proof, blood test reports) to complete verification.
            </p>
          </div>
          <span className="ml-auto bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Action Required
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <Clock className="h-5 w-5 text-yellow-500 mr-3" />
        <div>
          <h3 className="text-yellow-800 font-semibold">Verification Pending</h3>
          <p className="text-yellow-700 text-sm">
            Your documents are under review. Our admin team will verify your profile soon.
          </p>
        </div>
        <span className="ml-auto bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          Under Review
        </span>
      </div>
    </div>
  );
};

export default VerificationStatusBanner;
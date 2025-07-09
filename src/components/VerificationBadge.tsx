import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface VerificationBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  isVerified, 
  size = 'md', 
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (isVerified) {
    return (
      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
        <CheckCircle className={`${sizeClasses[size]} mr-1`} />
        {showText && 'Verified'}
      </span>
    );
  }

  return (
    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
      <Clock className={`${sizeClasses[size]} mr-1`} />
      {showText && 'Pending'}
    </span>
  );
};

export default VerificationBadge;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../config/constants';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const getDashboardPath = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case USER_ROLES.DOCTOR:
        return '/doctor';
      case USER_ROLES.PATIENT:
        return '/patient';
      case USER_ROLES.PHARMACIST:
        return '/pharmacist';
      default:
        return '/login';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-error-100 mb-6">
          <AlertTriangle className="h-8 w-8 text-error-600" />
        </div>
        <h1 className="text-3xl font-serif font-semibold text-gray-800 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate(getDashboardPath())}
          className="btn btn-primary w-full"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
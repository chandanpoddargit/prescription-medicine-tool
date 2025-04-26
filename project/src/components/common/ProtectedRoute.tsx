import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    // Redirect to the appropriate dashboard based on the user's role
    switch (user.role) {
      case 'doctor':
        return <Navigate to="/doctor" />;
      case 'patient':
        return <Navigate to="/patient" />;
      case 'pharmacist':
        return <Navigate to="/pharmacist" />;
      default:
        return <Navigate to="/login" />;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
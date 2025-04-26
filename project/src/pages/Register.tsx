import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, AlertCircle, Stethoscope, User, Pill } from 'lucide-react';
import { USER_ROLES } from '../config/constants';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!role) {
      setError('Please select a role');
      return;
    }
    
    try {
      await register(name, email, password, role);
      
      // Navigation will be handled based on the user role in AuthContext
    } catch (err) {
      console.error('Registration error:', err);
      // Error message is set in the AuthContext
    }
  };
  
  const getRoleIcon = (userRole: string) => {
    switch (userRole) {
      case USER_ROLES.DOCTOR:
        return <Stethoscope className="h-5 w-5" />;
      case USER_ROLES.PATIENT:
        return <User className="h-5 w-5" />;
      case USER_ROLES.PHARMACIST:
        return <Pill className="h-5 w-5" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center space-x-4 mb-4">
              <div className="bg-primary-100 p-2 rounded-full">
                <Stethoscope className="h-6 w-6 text-primary-600" />
              </div>
              <div className="bg-accent-100 p-2 rounded-full">
                <User className="h-6 w-6 text-accent-600" />
              </div>
              <div className="bg-secondary-100 p-2 rounded-full">
                <Pill className="h-6 w-6 text-secondary-600" />
              </div>
            </div>
            <h1 className="text-2xl font-serif font-semibold text-gray-800">Create an Account</h1>
            <p className="text-gray-600 mt-1">Join the MediTrack healthcare system</p>
          </div>
          
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-800 px-4 py-3 rounded-md flex items-start mb-6">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(USER_ROLES).map((userRole) => (
                    <div 
                      key={userRole}
                      onClick={() => setRole(userRole)}
                      className={`cursor-pointer rounded-lg border p-3 text-center transition-all ${
                        role === userRole 
                          ? 'border-primary-500 bg-primary-50 text-primary-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-center mb-1">
                        <div className={`${
                          role === userRole 
                            ? userRole === USER_ROLES.DOCTOR
                              ? 'text-primary-600'
                              : userRole === USER_ROLES.PATIENT
                                ? 'text-accent-600'
                                : 'text-secondary-600'
                            : 'text-gray-400'
                        }`}>
                          {getRoleIcon(userRole)}
                        </div>
                      </div>
                      <div className="text-sm font-medium capitalize">
                        {userRole}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full btn btn-primary flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-800 font-medium">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
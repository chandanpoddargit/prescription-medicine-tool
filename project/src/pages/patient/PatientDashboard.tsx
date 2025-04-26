import React from 'react';
import Navbar from '../../components/common/Navbar';
import PatientPrescriptions from '../../components/patient/PatientPrescriptions';
import { useAuth } from '../../contexts/AuthContext';
import { ClipboardList } from 'lucide-react';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar title="Patient Dashboard" />
      
      <div className="container mx-auto py-8 px-4 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-gray-800">
              Welcome, {user?.name}
            </h2>
            <p className="text-gray-600 mt-1">
              View and manage your prescriptions
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center">
          <ClipboardList className="h-6 w-6 text-primary-600 mr-3" />
          <h3 className="text-lg font-medium text-gray-800">Your Prescriptions</h3>
        </div>
        
        <PatientPrescriptions />
      </div>
    </div>
  );
};

export default PatientDashboard;
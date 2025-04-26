import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import PatientList from '../../components/doctor/PatientList';
import PrescriptionList from '../../components/doctor/PrescriptionList';
import { ClipboardList, Users, Plus } from 'lucide-react';

const DoctorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'patients'>('prescriptions');
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar title="Doctor Dashboard" />
      
      <div className="container mx-auto py-8 px-4 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-serif font-semibold text-gray-800">Welcome, Doctor</h2>
          </div>
          
          <button
            onClick={() => navigate('/doctor/create-prescription')}
            className="btn btn-primary flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>New Prescription</span>
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`flex items-center px-4 py-3 font-medium text-sm border-b-2 ${
                activeTab === 'prescriptions'
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ClipboardList className="h-5 w-5 mr-2" />
              Prescriptions
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`flex items-center px-4 py-3 font-medium text-sm border-b-2 ${
                activeTab === 'patients'
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-5 w-5 mr-2" />
              Patients
            </button>
          </div>
        </div>
        
        {activeTab === 'prescriptions' ? (
          <PrescriptionList />
        ) : (
          <PatientList />
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
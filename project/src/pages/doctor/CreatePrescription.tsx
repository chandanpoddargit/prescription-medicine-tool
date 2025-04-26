import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import PrescriptionForm from '../../components/doctor/PrescriptionForm';
import PatientList from '../../components/doctor/PatientList';

const CreatePrescription: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const patientId = location.state?.patientId;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar title="Create Prescription" />
      
      <div className="container mx-auto py-8 px-4 flex-1">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/doctor')}
            className="text-gray-500 hover:text-gray-700 mr-4"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-2xl font-serif font-semibold text-gray-800">
            {patientId ? 'Create New Prescription' : 'Select a Patient'}
          </h2>
        </div>
        
        {patientId ? (
          <PrescriptionForm patientId={patientId} />
        ) : (
          <div>
            <div className="mb-6">
              <p className="text-gray-600">
                Please select a patient to create a prescription for:
              </p>
            </div>
            <PatientList />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePrescription;
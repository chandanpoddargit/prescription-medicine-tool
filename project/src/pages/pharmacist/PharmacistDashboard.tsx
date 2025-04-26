import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import PendingPrescriptions from '../../components/pharmacist/PendingPrescriptions';
import { ClipboardList, Package } from 'lucide-react';

const PharmacistDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar title="Pharmacist Dashboard" />
      
      <div className="container mx-auto py-8 px-4 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-serif font-semibold text-gray-800">
              Pharmacy Management
            </h2>
          </div>
          
          <button
            onClick={() => navigate('/pharmacist/medicines')}
            className="btn btn-primary flex items-center space-x-1"
          >
            <Package className="h-4 w-4" />
            <span>Manage Medicines</span>
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center">
          <ClipboardList className="h-6 w-6 text-primary-600 mr-3" />
          <h3 className="text-lg font-medium text-gray-800">Pending Prescriptions</h3>
        </div>
        
        <PendingPrescriptions />
      </div>
    </div>
  );
};

export default PharmacistDashboard;
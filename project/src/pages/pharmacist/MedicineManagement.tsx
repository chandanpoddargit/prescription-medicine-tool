import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import MedicineList from '../../components/pharmacist/MedicineList';
import { Package } from 'lucide-react';

const MedicineManagement: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar title="Medicine Management" />
      
      <div className="container mx-auto py-8 px-4 flex-1">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/pharmacist')}
            className="text-gray-500 hover:text-gray-700 mr-4"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center">
            <Package className="h-6 w-6 text-secondary-600 mr-2" />
            <h2 className="text-2xl font-serif font-semibold text-gray-800">
              Medicine Inventory
            </h2>
          </div>
        </div>
        
        <MedicineList />
      </div>
    </div>
  );
};

export default MedicineManagement;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, PRESCRIPTION_STATUS } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, Search, Check, Clock, AlertTriangle } from 'lucide-react';

interface Prescription {
  _id: string;
  doctor: {
    _id: string;
    name: string;
  };
  medicines: Array<{
    medicine: {
      name: string;
    };
    dosage: string;
    frequency: string;
  }>;
  status: string;
  createdAt: string;
  notes: string;
}

const PatientPrescriptions: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/prescriptions/patient`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPrescriptions(response.data);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrescriptions();
  }, [token]);
  
  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.medicines.some(med => 
      med.medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    (prescription.notes && prescription.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case PRESCRIPTION_STATUS.CREATED:
        return <Clock className="h-5 w-5 text-primary-600" />;
      case PRESCRIPTION_STATUS.DISPENSED:
        return <AlertTriangle className="h-5 w-5 text-warning-600" />;
      case PRESCRIPTION_STATUS.COMPLETED:
        return <Check className="h-5 w-5 text-accent-600" />;
      default:
        return null;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case PRESCRIPTION_STATUS.CREATED:
        return 'Waiting for pharmacy';
      case PRESCRIPTION_STATUS.DISPENSED:
        return 'Ready for pickup';
      case PRESCRIPTION_STATUS.COMPLETED:
        return 'Completed';
      default:
        return status;
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search prescriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {filteredPrescriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrescriptions.map((prescription) => (
            <div 
              key={prescription._id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Dr. {prescription.doctor.name}</p>
                  <p className="text-xs text-gray-400">{formatDate(prescription.createdAt)}</p>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(prescription.status)}
                  <span className="text-sm ml-1">{getStatusText(prescription.status)}</span>
                </div>
              </div>
              
              <div className="p-4">
                <h4 className="font-medium text-gray-800 mb-2">Medicines:</h4>
                <ul className="space-y-2">
                  {prescription.medicines.map((medicine, index) => (
                    <li key={index} className="text-sm">
                      <span className="font-medium">{medicine.medicine.name}</span>
                      <p className="text-gray-600 text-xs">
                        {medicine.dosage}, {medicine.frequency}
                      </p>
                    </li>
                  ))}
                </ul>
                
                {prescription.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <h4 className="font-medium text-gray-800 mb-1">Notes:</h4>
                    <p className="text-sm text-gray-600">{prescription.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="p-3 bg-gray-50 border-t">
                <button
                  onClick={() => navigate(`/prescription/${prescription._id}`)}
                  className="w-full btn btn-outline flex items-center justify-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="bg-primary-50 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
            <Eye className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800">No prescriptions found</h3>
          <p className="text-gray-500 mt-1">
            {searchTerm 
              ? "No prescriptions match your search criteria" 
              : "You don't have any prescriptions yet"}
          </p>
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;
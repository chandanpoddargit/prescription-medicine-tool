import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, PRESCRIPTION_STATUS } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Search, Eye, FileText } from 'lucide-react';

interface Prescription {
  _id: string;
  patient: {
    _id: string;
    name: string;
    email: string;
  };
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
}

const PrescriptionList: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/prescriptions/doctor`, {
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
    prescription.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.medicines.some(med => 
      med.medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case PRESCRIPTION_STATUS.CREATED:
        return 'badge-primary';
      case PRESCRIPTION_STATUS.DISPENSED:
        return 'badge-warning';
      case PRESCRIPTION_STATUS.COMPLETED:
        return 'badge-accent';
      default:
        return 'badge-secondary';
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by patient name or medicine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {filteredPrescriptions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicines
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrescriptions.map((prescription) => (
                <tr key={prescription._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{prescription.patient.name}</div>
                    <div className="text-sm text-gray-500">{prescription.patient.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {prescription.medicines.slice(0, 2).map((med, index) => (
                        <div key={index}>
                          {med.medicine.name} ({med.dosage}, {med.frequency})
                        </div>
                      ))}
                      {prescription.medicines.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{prescription.medicines.length - 2} more
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(prescription.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getStatusBadgeClass(prescription.status)}`}>
                      {prescription.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/prescription/${prescription._id}`)}
                      className="btn btn-outline flex items-center space-x-1 ml-auto"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800">No prescriptions found</h3>
          <p className="text-gray-500 mt-1">
            {searchTerm 
              ? "No prescriptions match your search criteria" 
              : "You haven't created any prescriptions yet"}
          </p>
          {!searchTerm && (
            <button 
              onClick={() => navigate('/doctor/create-prescription')}
              className="btn btn-primary mt-4"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Create New Prescription
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PrescriptionList;
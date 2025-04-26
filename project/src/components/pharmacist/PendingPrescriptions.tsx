import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, PRESCRIPTION_STATUS } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, Eye, Clock, Search } from 'lucide-react';

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
      _id: string;
      name: string;
    };
    dosage: string;
    frequency: string;
  }>;
  status: string;
  createdAt: string;
}

const PendingPrescriptions: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const fetchPrescriptions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/prescriptions/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPrescriptions();
  }, [token]);
  
  const handleDispense = async (id: string) => {
    try {
      setProcessing(id);
      await axios.put(`${API_URL}/api/prescriptions/${id}/dispense`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPrescriptions();
    } catch (error) {
      console.error('Error dispensing prescription:', error);
    } finally {
      setProcessing(null);
    }
  };
  
  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.medicines.some(med => 
      med.medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
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
            placeholder="Search by patient name, doctor, or medicine..."
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
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicines
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrescriptions.map((prescription) => (
                <tr key={prescription._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{prescription.patient.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{prescription.doctor.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {prescription.medicines.slice(0, 2).map((med, index) => (
                        <div key={index}>{med.medicine.name}</div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/prescription/${prescription._id}`)}
                        className="btn btn-outline flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleDispense(prescription._id)}
                        disabled={processing === prescription._id}
                        className="btn btn-accent flex items-center space-x-1"
                      >
                        {processing === prescription._id ? (
                          <>
                            <Clock className="h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Dispense</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800">No pending prescriptions</h3>
          <p className="text-gray-500 mt-1">All prescriptions have been dispensed</p>
        </div>
      )}
    </div>
  );
};

export default PendingPrescriptions;
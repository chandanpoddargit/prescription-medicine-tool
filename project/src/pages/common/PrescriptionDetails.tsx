import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, PRESCRIPTION_STATUS, USER_ROLES } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/common/Navbar';
import { ClipboardList, User, Stethoscope, Calendar, Clock, Check, Download, AlertTriangle } from 'lucide-react';

interface PrescriptionDetail {
  _id: string;
  patient: {
    _id: string;
    name: string;
    email: string;
  };
  doctor: {
    _id: string;
    name: string;
    email: string;
  };
  medicines: Array<{
    medicine: {
      _id: string;
      name: string;
      description: string;
      dosageForm: string;
      strength: string;
    };
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const PrescriptionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [prescription, setPrescription] = useState<PrescriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/prescriptions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPrescription(response.data);
      } catch (err) {
        console.error('Error fetching prescription:', err);
        setError('Failed to load prescription details');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchPrescription();
    }
  }, [id, token]);
  
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdating(true);
      
      let endpoint = '';
      if (newStatus === PRESCRIPTION_STATUS.DISPENSED) {
        endpoint = `${API_URL}/api/prescriptions/${id}/dispense`;
      } else if (newStatus === PRESCRIPTION_STATUS.COMPLETED) {
        endpoint = `${API_URL}/api/prescriptions/${id}/complete`;
      }
      
      if (endpoint) {
        await axios.put(endpoint, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Refresh prescription data
        const response = await axios.get(`${API_URL}/api/prescriptions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPrescription(response.data);
      }
    } catch (err) {
      console.error('Error updating prescription status:', err);
      setError('Failed to update prescription status');
    } finally {
      setUpdating(false);
    }
  };
  
  const handleBackClick = () => {
    if (user?.role === USER_ROLES.DOCTOR) {
      navigate('/doctor');
    } else if (user?.role === USER_ROLES.PATIENT) {
      navigate('/patient');
    } else if (user?.role === USER_ROLES.PHARMACIST) {
      navigate('/pharmacist');
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case PRESCRIPTION_STATUS.CREATED:
        return 'bg-primary-100 text-primary-800';
      case PRESCRIPTION_STATUS.DISPENSED:
        return 'bg-warning-100 text-warning-800';
      case PRESCRIPTION_STATUS.COMPLETED:
        return 'bg-accent-100 text-accent-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case PRESCRIPTION_STATUS.CREATED:
        return <Clock className="h-5 w-5" />;
      case PRESCRIPTION_STATUS.DISPENSED:
        return <AlertTriangle className="h-5 w-5" />;
      case PRESCRIPTION_STATUS.COMPLETED:
        return <Check className="h-5 w-5" />;
      default:
        return null;
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar title="Prescription Details" />
        <div className="container mx-auto py-8 px-4 flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }
  
  if (error || !prescription) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar title="Prescription Details" />
        <div className="container mx-auto py-8 px-4 flex-1">
          <div className="bg-error-50 border border-error-200 text-error-800 px-6 py-4 rounded-md">
            <h3 className="text-lg font-medium">Error</h3>
            <p className="mt-2">{error || 'Prescription not found'}</p>
            <button 
              onClick={handleBackClick}
              className="mt-4 btn btn-outline"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar title="Prescription Details" />
      
      <div className="container mx-auto py-8 px-4 flex-1">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackClick}
            className="text-gray-500 hover:text-gray-700 mr-4"
          >
            ← Back
          </button>
          <div className="flex items-center">
            <ClipboardList className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-2xl font-serif font-semibold text-gray-800">
              Prescription Details
            </h2>
          </div>
          
          <div className="ml-auto flex items-center">
            <div className={`px-3 py-1 rounded-full flex items-center ${getStatusBadgeClass(prescription.status)}`}>
              {getStatusIcon(prescription.status)}
              <span className="ml-1 text-sm font-medium capitalize">{prescription.status}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Patient and Doctor Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <User className="h-5 w-5 text-accent-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-800">Patient Information</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-base">{prescription.patient.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base">{prescription.patient.email}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Stethoscope className="h-5 w-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-800">Doctor Information</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-base">Dr. {prescription.doctor.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base">{prescription.doctor.email}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 text-secondary-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-800">Prescription Details</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Created On</p>
                  <p className="text-base">{formatDate(prescription.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-base">{formatDate(prescription.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusBadgeClass(prescription.status)}`}>
                    {getStatusIcon(prescription.status)}
                    <span className="ml-1 capitalize">{prescription.status}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Medicines and Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Prescribed Medicines</h3>
              
              <div className="space-y-4">
                {prescription.medicines.map((med, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">{med.medicine.name}</h4>
                        <p className="text-sm text-gray-600">{med.medicine.description}</p>
                        <p className="text-xs text-gray-500">
                          {med.medicine.dosageForm} - {med.medicine.strength}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Dosage</p>
                        <p className="text-sm">{med.dosage}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Frequency</p>
                        <p className="text-sm">{med.frequency}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Duration</p>
                        <p className="text-sm">{med.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {prescription.notes && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Notes</h3>
                <p className="text-gray-700 whitespace-pre-line">{prescription.notes}</p>
              </div>
            )}
            
            {/* Actions based on user role */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Actions</h3>
              
              <div className="flex flex-wrap gap-3">
                <button className="btn btn-outline flex items-center space-x-1">
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </button>
                
                {user?.role === USER_ROLES.PHARMACIST && prescription.status === PRESCRIPTION_STATUS.CREATED && (
                  <button
                    onClick={() => handleStatusUpdate(PRESCRIPTION_STATUS.DISPENSED)}
                    disabled={updating}
                    className="btn btn-accent flex items-center space-x-1"
                  >
                    {updating ? (
                      <>
                        <Clock className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Mark as Dispensed</span>
                      </>
                    )}
                  </button>
                )}
                
                {user?.role === USER_ROLES.PATIENT && prescription.status === PRESCRIPTION_STATUS.DISPENSED && (
                  <button
                    onClick={() => handleStatusUpdate(PRESCRIPTION_STATUS.COMPLETED)}
                    disabled={updating}
                    className="btn btn-accent flex items-center space-x-1"
                  >
                    {updating ? (
                      <>
                        <Clock className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Mark as Completed</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDetails;
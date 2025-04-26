import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Plus, AlertCircle } from 'lucide-react';

interface Medicine {
  _id: string;
  name: string;
  description: string;
  dosageForm: string;
  strength: string;
}

interface MedicineWithDosage extends Medicine {
  dosage: string;
  frequency: string;
  duration: string;
}

interface PatientInfo {
  _id: string;
  name: string;
  email: string;
}

interface PrescriptionFormProps {
  patientId: string;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ patientId }) => {
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<MedicineWithDosage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPatientAndMedicines = async () => {
      try {
        setLoading(true);
        
        // Fetch patient info
        const patientResponse = await axios.get(`${API_URL}/api/users/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatient(patientResponse.data);
        
        // Fetch medicines
        const medicinesResponse = await axios.get(`${API_URL}/api/medicines`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMedicines(medicinesResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch necessary data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientAndMedicines();
  }, [patientId, token]);
  
  const filteredMedicines = medicines.filter(medicine => 
    !selectedMedicines.some(selected => selected._id === medicine._id) &&
    (medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     medicine.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleAddMedicine = (medicine: Medicine) => {
    setSelectedMedicines([...selectedMedicines, {
      ...medicine,
      dosage: '',
      frequency: '',
      duration: ''
    }]);
    setSearchTerm('');
  };
  
  const handleRemoveMedicine = (medicineId: string) => {
    setSelectedMedicines(selectedMedicines.filter(med => med._id !== medicineId));
  };
  
  const handleMedicineChange = (index: number, field: keyof MedicineWithDosage, value: string) => {
    const updatedMedicines = [...selectedMedicines];
    updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
    setSelectedMedicines(updatedMedicines);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedMedicines.length === 0) {
      setError('Please add at least one medicine to the prescription');
      return;
    }
    
    // Check if any medicine is missing dosage information
    const incompleteMedicine = selectedMedicines.find(med => 
      !med.dosage || !med.frequency || !med.duration
    );
    
    if (incompleteMedicine) {
      setError(`Please complete all dosage information for ${incompleteMedicine.name}`);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const prescriptionData = {
        patient: patientId,
        doctor: user?._id,
        medicines: selectedMedicines.map(med => ({
          medicine: med._id,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration
        })),
        notes
      };
      
      await axios.post(`${API_URL}/api/prescriptions`, prescriptionData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      navigate('/doctor');
    } catch (err) {
      console.error('Error creating prescription:', err);
      setError('Failed to create prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !patient) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-800 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {/* Patient Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Patient Information</h3>
        {patient && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-base">{patient.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-base">{patient.email}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Medicine Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Prescribed Medicines</h3>
        
        {/* Medicine Search */}
        <div className="mb-6">
          <label htmlFor="medicine-search" className="block text-sm font-medium text-gray-700 mb-1">
            Search and Add Medicines
          </label>
          <div className="relative">
            <input
              type="text"
              id="medicine-search"
              className="input"
              placeholder="Search medicines by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && filteredMedicines.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                {filteredMedicines.map(medicine => (
                  <div 
                    key={medicine._id}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                    onClick={() => handleAddMedicine(medicine)}
                  >
                    <div className="font-medium text-gray-800">{medicine.name}</div>
                    <div className="text-sm text-gray-600">{medicine.description}</div>
                    <div className="text-xs text-gray-500">
                      {medicine.dosageForm} - {medicine.strength}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {searchTerm && filteredMedicines.length === 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200">
                <div className="px-4 py-2 text-gray-500">No medicines found</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Selected Medicines */}
        <div className="space-y-4">
          {selectedMedicines.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-500">No medicines added yet</p>
              <button 
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-2 btn btn-outline"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Medicine
              </button>
            </div>
          ) : (
            selectedMedicines.map((medicine, index) => (
              <div key={medicine._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{medicine.name}</h4>
                    <p className="text-sm text-gray-600">{medicine.description}</p>
                    <p className="text-xs text-gray-500">
                      {medicine.dosageForm} - {medicine.strength}
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleRemoveMedicine(medicine._id)}
                    className="text-gray-400 hover:text-error-500 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dosage
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., 1 tablet"
                      value={medicine.dosage}
                      onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., Twice daily"
                      value={medicine.frequency}
                      onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., 7 days"
                      value={medicine.duration}
                      onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Notes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Notes</h3>
        <textarea
          className="input h-32"
          placeholder="Enter any additional instructions or notes for the patient..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/doctor')}
          className="btn btn-outline mr-4"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Prescription'}
        </button>
      </div>
    </form>
  );
};

export default PrescriptionForm;
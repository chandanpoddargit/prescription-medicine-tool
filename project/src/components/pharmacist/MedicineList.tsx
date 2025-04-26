import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Edit, Trash2, Plus, AlertCircle, X } from 'lucide-react';
import MedicineForm from './MedicineForm';

interface Medicine {
  _id: string;
  name: string;
  description: string;
  dosageForm: string;
  strength: string;
  manufacturer: string;
  stockQuantity: number;
}

const MedicineList: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [medicineToEdit, setMedicineToEdit] = useState<Medicine | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/medicines`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedicines(response.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMedicines();
  }, [token]);
  
  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleEdit = (medicine: Medicine) => {
    setMedicineToEdit(medicine);
    setShowForm(true);
  };
  
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/medicines/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedicines(medicines.filter(med => med._id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete medicine. Please try again.');
    }
  };
  
  const handleFormSuccess = () => {
    fetchMedicines();
    setShowForm(false);
    setMedicineToEdit(undefined);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md">
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-800 px-4 py-3 rounded-md flex items-start mb-4">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto pl-3"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {showForm ? (
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {medicineToEdit ? 'Edit Medicine' : 'Add New Medicine'}
          </h3>
          <MedicineForm 
            onSuccess={handleFormSuccess} 
            onCancel={() => {
              setShowForm(false);
              setMedicineToEdit(undefined);
            }}
            medicineToEdit={medicineToEdit}
          />
        </div>
      ) : (
        <>
          <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="btn btn-primary flex items-center space-x-1 w-full md:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add Medicine</span>
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medicine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMedicines.length > 0 ? (
                    filteredMedicines.map((medicine) => (
                      <tr key={medicine._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                          <div className="text-sm text-gray-500">{medicine.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {medicine.dosageForm} - {medicine.strength}
                          </div>
                          <div className="text-sm text-gray-500">{medicine.manufacturer}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            medicine.stockQuantity > 20 
                              ? 'bg-accent-100 text-accent-800' 
                              : medicine.stockQuantity > 5 
                                ? 'bg-warning-100 text-warning-800' 
                                : 'bg-error-100 text-error-800'
                          }`}>
                            {medicine.stockQuantity} units
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {deleteConfirm === medicine._id ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDelete(medicine._id)}
                                className="text-error-600 hover:text-error-800 font-medium"
                              >
                                Confirm
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end space-x-3">
                              <button
                                onClick={() => handleEdit(medicine)}
                                className="text-primary-600 hover:text-primary-800"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(medicine._id)}
                                className="text-error-600 hover:text-error-800"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        No medicines found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MedicineList;
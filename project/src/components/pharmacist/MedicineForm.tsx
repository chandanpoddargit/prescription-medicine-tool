import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

interface MedicineFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  medicineToEdit?: Medicine;
}

interface Medicine {
  _id?: string;
  name: string;
  description: string;
  dosageForm: string;
  strength: string;
  manufacturer: string;
  stockQuantity: number;
}

const MedicineForm: React.FC<MedicineFormProps> = ({ onSuccess, onCancel, medicineToEdit }) => {
  const [formData, setFormData] = useState<Medicine>(
    medicineToEdit || {
      name: '',
      description: '',
      dosageForm: '',
      strength: '',
      manufacturer: '',
      stockQuantity: 0
    }
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'stockQuantity' ? parseInt(value) || 0 : value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      if (medicineToEdit?._id) {
        await axios.put(`${API_URL}/api/medicines/${medicineToEdit._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/api/medicines`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save medicine. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-800 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Medicine Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="input"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="input"
          value={formData.description}
          onChange={handleChange}
          required
        ></textarea>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dosageForm" className="block text-sm font-medium text-gray-700 mb-1">
            Dosage Form
          </label>
          <select
            id="dosageForm"
            name="dosageForm"
            className="input"
            value={formData.dosageForm}
            onChange={handleChange}
            required
          >
            <option value="">Select Dosage Form</option>
            <option value="Tablet">Tablet</option>
            <option value="Capsule">Capsule</option>
            <option value="Liquid">Liquid</option>
            <option value="Injection">Injection</option>
            <option value="Cream">Cream</option>
            <option value="Ointment">Ointment</option>
            <option value="Inhaler">Inhaler</option>
            <option value="Powder">Powder</option>
            <option value="Spray">Spray</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="strength" className="block text-sm font-medium text-gray-700 mb-1">
            Strength
          </label>
          <input
            type="text"
            id="strength"
            name="strength"
            className="input"
            placeholder="e.g., 500mg, 10mg/ml"
            value={formData.strength}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-1">
            Manufacturer
          </label>
          <input
            type="text"
            id="manufacturer"
            name="manufacturer"
            className="input"
            value={formData.manufacturer}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 mb-1">
            Stock Quantity
          </label>
          <input
            type="number"
            id="stockQuantity"
            name="stockQuantity"
            className="input"
            min="0"
            value={formData.stockQuantity}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : (medicineToEdit ? 'Update Medicine' : 'Add Medicine')}
        </button>
      </div>
    </form>
  );
};

export default MedicineForm;
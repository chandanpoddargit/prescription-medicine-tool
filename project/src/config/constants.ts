export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const USER_ROLES = {
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  PHARMACIST: 'pharmacist'
};

export const PRESCRIPTION_STATUS = {
  CREATED: 'created',
  DISPENSED: 'dispensed',
  COMPLETED: 'completed'
};
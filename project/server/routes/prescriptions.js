import express from 'express';
import Prescription from '../models/Prescription.js';
import Medicine from '../models/Medicine.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/prescriptions
// @desc    Get all prescriptions
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .populate('medicines.medicine', 'name description dosageForm strength')
      .sort({ createdAt: -1 });
    
    res.json(prescriptions);
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/prescriptions/doctor
// @desc    Get prescriptions created by the doctor
// @access  Private/Doctor
router.get('/doctor', protect, authorize('doctor'), async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctor: req.user._id })
      .populate('patient', 'name email')
      .populate('doctor', 'name')
      .populate('medicines.medicine', 'name')
      .sort({ createdAt: -1 });
    
    res.json(prescriptions);
  } catch (error) {
    console.error('Get doctor prescriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/prescriptions/patient
// @desc    Get prescriptions for the patient
// @access  Private/Patient
router.get('/patient', protect, authorize('patient'), async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate('doctor', 'name email')
      .populate('medicines.medicine', 'name description dosageForm strength')
      .sort({ createdAt: -1 });
    
    res.json(prescriptions);
  } catch (error) {
    console.error('Get patient prescriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/prescriptions/pending
// @desc    Get pending prescriptions (status = 'created')
// @access  Private/Pharmacist
router.get('/pending', protect, authorize('pharmacist'), async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ status: 'created' })
      .populate('patient', 'name email')
      .populate('doctor', 'name')
      .populate('medicines.medicine', 'name')
      .sort({ createdAt: -1 });
    
    res.json(prescriptions);
  } catch (error) {
    console.error('Get pending prescriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/prescriptions/:id
// @desc    Get prescription by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .populate('medicines.medicine', 'name description dosageForm strength');
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    // Determine if user has access to this prescription
    const isDoctor = req.user.role === 'doctor' && 
                    req.user._id.toString() === prescription.doctor._id.toString();
    const isPatient = req.user.role === 'patient' && 
                     req.user._id.toString() === prescription.patient._id.toString();
    const isPharmacist = req.user.role === 'pharmacist';
    
    if (!isDoctor && !isPatient && !isPharmacist) {
      return res.status(403).json({ message: 'Not authorized to view this prescription' });
    }
    
    res.json(prescription);
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/prescriptions
// @desc    Create a new prescription
// @access  Private/Doctor
router.post('/', protect, authorize('doctor'), async (req, res) => {
  try {
    const { patient, medicines, notes } = req.body;
    
    // Create the prescription
    const prescription = new Prescription({
      patient,
      doctor: req.user._id,
      medicines,
      notes,
      status: 'created'
    });
    
    const createdPrescription = await prescription.save();
    
    res.status(201).json(createdPrescription);
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/prescriptions/:id/dispense
// @desc    Update prescription status to dispensed
// @access  Private/Pharmacist
router.put('/:id/dispense', protect, authorize('pharmacist'), async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    if (prescription.status !== 'created') {
      return res.status(400).json({ message: 'Prescription already dispensed or completed' });
    }
    
    // Update medicine stock quantities
    for (const item of prescription.medicines) {
      const medicine = await Medicine.findById(item.medicine);
      
      if (medicine) {
        // Reduce stock quantity by 1 (or another appropriate amount)
        if (medicine.stockQuantity > 0) {
          medicine.stockQuantity -= 1;
          await medicine.save();
        }
      }
    }
    
    // Update prescription status
    prescription.status = 'dispensed';
    const updatedPrescription = await prescription.save();
    
    res.json(updatedPrescription);
  } catch (error) {
    console.error('Dispense prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/prescriptions/:id/complete
// @desc    Update prescription status to completed
// @access  Private/Patient
router.put('/:id/complete', protect, authorize('patient'), async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    if (prescription.status !== 'dispensed') {
      return res.status(400).json({ message: 'Prescription cannot be marked as completed yet' });
    }
    
    // Ensure only the patient can mark their own prescription as completed
    if (prescription.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this prescription' });
    }
    
    // Update prescription status
    prescription.status = 'completed';
    const updatedPrescription = await prescription.save();
    
    res.json(updatedPrescription);
  } catch (error) {
    console.error('Complete prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
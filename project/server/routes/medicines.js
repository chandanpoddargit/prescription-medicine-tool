import express from 'express';
import Medicine from '../models/Medicine.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/medicines
// @desc    Get all medicines
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ name: 1 });
    res.json(medicines);
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/medicines/:id
// @desc    Get medicine by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    res.json(medicine);
  } catch (error) {
    console.error('Get medicine error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/medicines
// @desc    Create a new medicine
// @access  Private/Pharmacist
router.post('/', protect, authorize('pharmacist'), async (req, res) => {
  try {
    const { name, description, dosageForm, strength, manufacturer, stockQuantity } = req.body;
    
    const medicine = new Medicine({
      name,
      description,
      dosageForm,
      strength,
      manufacturer,
      stockQuantity
    });
    
    const createdMedicine = await medicine.save();
    res.status(201).json(createdMedicine);
  } catch (error) {
    console.error('Create medicine error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/medicines/:id
// @desc    Update a medicine
// @access  Private/Pharmacist
router.put('/:id', protect, authorize('pharmacist'), async (req, res) => {
  try {
    const { name, description, dosageForm, strength, manufacturer, stockQuantity } = req.body;
    
    const medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    medicine.name = name || medicine.name;
    medicine.description = description || medicine.description;
    medicine.dosageForm = dosageForm || medicine.dosageForm;
    medicine.strength = strength || medicine.strength;
    medicine.manufacturer = manufacturer || medicine.manufacturer;
    medicine.stockQuantity = stockQuantity !== undefined ? stockQuantity : medicine.stockQuantity;
    
    const updatedMedicine = await medicine.save();
    res.json(updatedMedicine);
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/medicines/:id
// @desc    Delete a medicine
// @access  Private/Pharmacist
router.delete('/:id', protect, authorize('pharmacist'), async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    await medicine.deleteOne();
    res.json({ message: 'Medicine removed' });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
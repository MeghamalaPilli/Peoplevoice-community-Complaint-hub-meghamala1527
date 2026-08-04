const express = require('express');
const router = express.Router();

const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');

// CREATE CATEGORY (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { value, label, description, status = 'Active' } = req.body;

    if (!value || !label) {
      return res.status(400).json({
        success: false,
        message: 'Category value and label are required'
      });
    }

    const existing = await Category.findOne({ value });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Category value already exists'
      });
    }

    const category = await Category.create({
      value,
      label,
      description,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// GET CATEGORIES
router.get('/', async (req, res) => {
  try {
    const activeOnly = req.query.all !== 'true';
    const query = activeOnly ? { status: 'Active' } : {};
    const categories = await Category.find(query).sort({ label: 1 });

    res.json({
      success: true,
      categories
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// UPDATE CATEGORY
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { value, label, description, status } = req.body;
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: 'Category ID is required' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (value && value !== category.value) {
      const existing = await Category.findOne({ value, _id: { $ne: category._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Category key already exists' });
      }
      category.value = value;
    }

    if (label !== undefined) category.label = label;
    if (description !== undefined) category.description = description;
    if (status !== undefined && ['Active', 'Inactive'].includes(status)) category.status = status;

    await category.save();

    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().populate('parent');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get only parent categories (no parent)
router.get('/parents', async (req, res) => {
  try {
    const parents = await Category.find({ parent: null });
    res.json(parents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get subcategories of a parent
router.get('/sub/:parentId', async (req, res) => {
  try {
    const subs = await Category.find({ parent: req.params.parentId });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create category
router.post('/', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    await Category.deleteMany({ parent: req.params.id });
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const mongoose = require('mongoose');
const Flat = require('../models/flatSchema');

// Validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get a flat by ID
const getFlatById = async (req, res, next) => {
  const flatId = req.params.id;
  try {
    if (!isValidObjectId(flatId)) {
      return res.status(400).json({ error: 'Invalid flat ID format' });
    }

    const flat = await Flat.findById(flatId);
    if (!flat) {
      return res.status(404).json({ error: 'Flat not found' });
    }

    res.status(200).json(flat);
  } catch (error) {
    console.error('Error fetching flat:', error.message);
    res.status(500).json({ error: 'Error fetching flat' });
  }
};

// Get all flats
const getAllFlats = async (req, res) => {
  try {
    const flats = await Flat.find();
    res.status(200).json({
      message: 'All flats fetched successfully',
      data: flats
    });
  } catch (error) {
    console.error('Error fetching flats:', error.message);
    res.status(500).json({ error: 'Error fetching flats' });
  }
};

// Create a new flat
const createFlat = async (flatData) => {
  try {
    const flat = new Flat(flatData);
    const savedFlat = await flat.save();
    return { status: 201, message: 'Flat created successfully', data: savedFlat };
  } catch (error) {
    console.error('Error creating flat:', error.message);
    return { status: 500, message: `Error creating flat: ${error.message}` };
  }
};

// Create multiple flats
const createFlats = async (req, res, next) => {
  try {
    const flatsData = Array.isArray(req.body) ? req.body : [req.body];
    const createdFlats = await Promise.all(flatsData.map(flatData => createFlat(flatData)));
    res.status(201).json({
      message: 'Flats created successfully',
      data: createdFlats
    });
  } catch (error) {
    console.error('Error creating flats:', error.message);
    next(error); 
  }
};

// Update a flat
const updateFlat = async (req, res) => {
  const id = req.params.id;
  const flatData = req.body;

  try {
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid flat ID format' });
    }

    const flat = await Flat.findByIdAndUpdate(id, flatData, { new: true });
    if (!flat) {
      return res.status(404).json({ error: 'Flat not found' });
    }

    res.status(200).json({
      message: 'Flat updated successfully',
      data: flat
    });
  } catch (error) {
    console.error('Error updating flat:', error.message);
    res.status(500).json({ error: `Error updating flat: ${error.message}` });
  }
};

// Delete a flat
const deleteFlat = async (req, res) => {
  const id = req.params.id;
  try {
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid flat ID format' });
    }

    const flat = await Flat.findByIdAndDelete(id);
    if (!flat) {
      return res.status(404).json({ error: 'Flat not found' });
    }

    res.status(200).json({
      message: 'Flat deleted successfully',
      data: flat
    });
  } catch (error) {
    console.error('Error deleting flat:', error.message);
    res.status(500).json({ error: `Error deleting flat: ${error.message}` });
  }
};

module.exports = {
  getFlatById,
  getAllFlats,
  createFlat,
  updateFlat,
  deleteFlat,
  createFlats
};

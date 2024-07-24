const express = require('express');
const {
  getFlatById,
  getAllFlats,
  updateFlat,
  createFlats,
  deleteFlat
} = require('../service/flatService');
const { checkRole, authenticationToken } = require('../service/authService');

const router = express.Router();

//getFlatById
router.get('/flats/:id', authenticationToken, checkRole('user'), getFlatById);

//getAllFlats
router.get('/flats', authenticationToken, checkRole('user'), getAllFlats);

//createFlat
router.post('/flats', authenticationToken, checkRole('user'), createFlats);

//updateFlat
router.put('/flats/update/:id', authenticationToken, checkRole('user'), updateFlat);

//deleteFlat
router.delete('/flats/delete/:id', authenticationToken, checkRole('user'), deleteFlat);

module.exports = router;

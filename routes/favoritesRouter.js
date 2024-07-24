const express = require('express');
const router = express.Router();
const { checkRole, authenticationToken } = require('../service/authService');
const { addFavorite, getFavoriteByUserId, deleteFavorite } = require('../service/favoritesService');

// Add Favorites
router.post('/favorites', authenticationToken, checkRole('user'), addFavorite);

// Get Favorites from User
router.get('/favorites', authenticationToken, checkRole('user'), getFavoriteByUserId);

// Delete Favorite
router.delete('/favorite/delete', authenticationToken, checkRole('user'), deleteFavorite);

module.exports = router;

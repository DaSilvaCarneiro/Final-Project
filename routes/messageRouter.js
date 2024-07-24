const express = require('express');
const router = express.Router();
const { getMessage, getUserMessage, postMessage } = require('../service/messageService');
const { checkRole, authenticationToken } = require('../service/authService');

// Get Messages on Flat
router.get('/flat/message/:id', authenticationToken, checkRole('user'), getMessage);

// Get Messages on Flat From User
router.get('/flat/user/message/:id', authenticationToken, checkRole('user'), getUserMessage);

// Post Messages
router.post('/flat/message', authenticationToken, checkRole('user'), postMessage);

module.exports = router;

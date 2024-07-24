const express = require('express');
require('dotenv').config();
const { 
    signup,
    login,
    forgotPassword,
    resetPassword
} = require('../service/authService');

const router = express.Router();

//signUp
router.post('/signup', signup);

//login
router.post('/login', login);

//forgotPassword
router.post('/forgot-password', forgotPassword);

//resetPassword
router.post('/reset-password', resetPassword);

module.exports = router;

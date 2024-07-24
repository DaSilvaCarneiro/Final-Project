const express = require('express');
require('dotenv').config();
const {
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  deactivateUser,
  createNewUser
} = require('../service/userService');
const { checkRole, authenticationToken } = require('../service/authService');

const router = express.Router();

//getUsersById
router.get('/users/:id', authenticationToken, checkRole('user'), getUserById);

//getAllUsers
router.get('/users', authenticationToken, checkRole('user'), getAllUsers);

//createUser
router.post('/user/new', authenticationToken, checkRole('user'), createNewUser);

//updateUser
router.put('/user/update/:id', authenticationToken, checkRole('user'), updateUser);

//deleteUser
router.delete('/user/delete/:id', authenticationToken, checkRole('user'), deleteUser);

//deactivateUser
router.delete('/user/deactivate/:userId', authenticationToken, checkRole('user'), deactivateUser);

module.exports = router;

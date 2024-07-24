const mongoose = require('mongoose');
const User = require('../models/userSchema');
require('dotenv').config();
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const getUserById = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);

    if (!user) {
      console.log(`User with ID ${userId} not found.`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`Fetched user with ID ${userId}.`);
    res.status(200).json({
      message: `Fetched user with ID ${userId}.`,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Error fetching user' });
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    console.log('Fetched all users.');
    res.status(200).json({
      message: 'Fetched all users.',
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const usersData = Array.isArray(req.body) ? req.body : [req.body];

    const createdUsers = await Promise.all(usersData.map(async (userData) => {
      const user = new User(userData);
      return user.save();
    }));

    console.log('Created new users.');
    res.status(201).json({
      message: 'Created new users.',
      data: createdUsers
    });
  } catch (error) {
    console.error('Error creating users:', error.message);
    next(error);
  }
};

const updateUser = async (req, res) => {
  console.log('Received request to update user.');
  try {
    const id = req.params.id;
    const userData = req.body;

    console.log(`Validating user ID: ${id}`);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`Invalid user ID: ${id}`);
      return res.status(400).send({ error: 'Invalid user ID' });
    }

    console.log(`Finding and updating user with ID: ${id}`);
    const user = await User.findByIdAndUpdate(id, userData, { new: true });

    if (!user) {
      console.log(`User with ID ${id} not found.`);
      return res.status(404).send({ error: 'User not found' });
    }

    console.log(`User with ID ${id} updated successfully.`);
    return res.status(200).send({
      message: 'User updated successfully.',
      data: user
    });
  } catch (error) {
    console.error(`Error updating user with ID ${id}: ${error.message}`);
    return res.status(500).send({ error: `Error updating user: ${error.message}` });
  }
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.id;

  if (!userId) {
    console.log('No User ID provided.');
    return res.status(400).json({
      message: 'No User ID provided.'
    });
  }

  if (!mongoose.isValidObjectId(userId)) {
    console.log(`Invalid User ID format: ${userId}`);
    return res.status(400).json({
      message: 'Invalid User ID format.'
    });
  }
  try {
    await User.findByIdAndDelete(userId);
    console.log(`Deleted user with ID ${userId}.`);
    res.status(204).json({
      message: `Deleted user with ID ${userId}.`
    });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    next(error);
  }
};

const authenticateUser = async ({
  email,
  password
}) => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_URI);

    const user = await User.findOne({
      email
    });

    const result = await bcrypt.compare(password, user.password);
    console.log('result', result);

    if (!result) {
      throw new Error();
    }

    return jsonwebtoken.sign(
      {
        userId: user._id,
        email: user.email,
        roles: user.roles
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 3600
      }
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deactivateUser = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    console.log('No User ID provided.');
    return res.status(400).json({
      message: 'No User ID provided.'
    });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.log(`Invalid User ID format: ${userId}`);
    return res.status(400).json({
      message: 'Invalid User ID format.'
    });
  }

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      console.log(`User with ID ${userId} not found.`);
      return res.status(404).json({
        message: `User with ID ${userId} not found.`
      });
    }

    // Deactivate the user
    user.isActive = false;
    await user.save();

    console.log(`User with ID ${userId} deactivated.`);
    return res.status(200).json({
      message: `User with ID ${userId} deactivated.`,
      status: 'success',
      data: {}
    });
  } catch (error) {
    console.error(`Error deactivating user with ID ${userId}:`, error);
    return res.status(500).json({
      message: 'An error occurred while deactivating the user.',
      error: error.message
    });
  }
};


const createNewUser = async (req, res, next) => {
  try {
    const userData = req.body;

    const user = new User(userData);
    await user.save();

    console.log('Created new user.');
    return res.status(201).json({
      message: 'Created new user.',
      data: user
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    next(error);
  }
};


module.exports = {
  getUserById,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  authenticateUser,
  deactivateUser,
  createNewUser
};

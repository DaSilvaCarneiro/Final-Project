const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/userSchema');
const mongoose = require('mongoose');
const { createUser } = require('../service/userService');
const { sendForgotPasswordEmail } = require('./sendMailService');
const bcrypt = require('bcrypt');
const validator = require('validator');

const checkRole = (requiredRole) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user.roles.includes(requiredRole)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient role' });
        }
        next();
    };
};

const authenticationToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }

    try {
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found for authentication' });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(403).json({ error: 'Invalid authentication token' });
    }
};

const signup = async (req, res, next) => {
    const { email, password, firstName, lastName, birthDate } = req.body;

    // Check if all required fields are provided
    if (!email || !password || !firstName || !lastName || !birthDate) {
        return res.status(400).json({
            message: 'All fields are required: email, password, firstName, lastName, birthDate.',
            status: 'failure'
        });
    }

    // Prepare user data with default role
    const userData = { email, password, firstName, lastName, birthDate, roles: ['user'] };

    try {
        // Pass the request with user data to createUser function
        req.body = userData;  // Ensure req.body contains the user data
        await createUser(req, res, next);
    } catch (error) {
        console.error('Error signing up:', error.message);
        res.status(400).json({
            message: 'Error signing up.',
            status: 'failure',
            error: error.message
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const sanitizedEmail = validator.normalizeEmail(email);

        const user = await User.findOne({ email: sanitizedEmail });
        if (!user) {
            return res.status(401).json({ message: 'Email not found.' });
        }

        const result = await bcrypt.compare(password, user.password);
        if (!result) {
            return res.status(401).json({ message: 'Password does not match.' });
        }

        const token = jsonwebtoken.sign(
            {
                userId: user._id,
                email: user.email,
                roles: user.roles
            },
            process.env.JWT_SECRET
        );

        return res.status(200).json({
            message: `User Logged In. Welcome ${user.firstName}`,
            token,
            data: { email: user.email }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};


const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_URI);

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.resetPasswordToken = Math.round(Math.random() * 100000).toString();
        user.resetPasswordExpires = Date.now() + 3600000;

        await sendForgotPasswordEmail(user);
        await user.save();
        console.log('Reset Password Token Sent!');
        return res.status(200).json({ message: 'Reset password token sent' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const resetPassword = async (req, res) => {
    const { email, token, password } = req.body;
    try {
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }

        await mongoose.connect(process.env.MONGODB_CONNECTION_URI);

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.resetPasswordToken || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        if (token !== user.resetPasswordToken) {
            return res.status(400).json({ message: 'Token does not match' });
        }

        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        console.log('Password Changed Successfully!');
        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    checkRole,
    authenticationToken,
    signup,
    login,
    forgotPassword,
    resetPassword,
};

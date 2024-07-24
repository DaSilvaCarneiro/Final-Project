const userFavoritesSchema = require('../models/userFavoritesSchema');
const User = require('../models/userSchema');

// Add Favorites
const addFavorite = async (req, res) => {
    const { favorites } = req.body;
    const userId = req.user._id;

    if (!userId || !Array.isArray(favorites) || favorites.length === 0) {
        console.log('Invalid request: userId and favorites are required and favorites must be a non-empty array');
        return res.status(400).json({ message: 'Invalid request: userId and favorites are required and favorites must be a non-empty array' });
    }

    const userFavorites = new userFavoritesSchema({
        userId,
        favorites
    });

    try {
        const newUserFavorites = await userFavorites.save();
        console.log('Favorites added successfully:', newUserFavorites);
        res.status(201).json({
            message: 'Favorites added successfully',
            data: newUserFavorites
        });
    } catch (err) {
        console.error('Error adding favorites:', err.message);
        res.status(400).json({ message: `Error adding favorites: ${err.message}` });
    }
};

// Get Favorites from User
const getFavoriteByUserId = async (req, res) => {
    try {
        const userId = req.user._id;

        const favorites = await userFavoritesSchema.find({ userId }).sort({ createdAt: -1 });

        if (favorites.length === 0) {
            console.log('No favorites found for this user:', userId);
            return res.status(404).json({ message: 'No favorites found for this user' });
        }

        const user = await User.findById(userId);

        const favoritesWithUserDetails = favorites.map(favorite => ({
            ...favorite.toObject(),
            user: {
                firstName: user.firstName,
                lastName: user.lastName
            }
        }));

        console.log('Favorites fetched successfully for user:', userId);
        res.json({
            message: 'Favorites fetched successfully',
            data: favoritesWithUserDetails
        });
    } catch (err) {
        console.error('Error fetching favorites:', err.message);
        res.status(500).json({ message: `Error fetching favorites: ${err.message}` });
    }
};

// Delete Favorite
const deleteFavorite = async (req, res) => {
    const { favorites } = req.body;
    const flatId = favorites[0];
    const userId = req.user._id;


    if (req.user._id !== userId) {
        console.log('Forbidden: Attempt to remove another user\'s favorites');
        return res.status(403).json({ message: 'Forbidden: You can only remove your own favorites' });
    }

    try {
        const userFavorites = await userFavoritesSchema.findOne({ userId });

        if (!userFavorites) {
            console.log('User favorites not found for userId:', userId);
            return res.status(404).json({ message: 'User favorites not found' });
        }

        const index = userFavorites.favorites.findIndex(fav => fav.equals(flatId));

        if (index === -1) {
            console.log('Favorite flat not found in favorites for flatId:', flatId);
            return res.status(404).json({ message: 'Favorite flat not found in favorites' });
        }

        userFavorites.favorites.splice(index, 1);

        await userFavorites.save();

        console.log('Favorite flat deleted successfully for flatId:', flatId);
        res.json({ message: 'Favorite flat deleted successfully' });
    } catch (err) {
        console.error('Error deleting favorite flat:', err.message);
        res.status(500).json({ message: `Error deleting favorite flat: ${err.message}` });
    }
};

module.exports = {
    addFavorite,
    getFavoriteByUserId,
    deleteFavorite
};

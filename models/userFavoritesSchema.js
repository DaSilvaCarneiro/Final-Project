const mongoose = require('mongoose');

const userFavoritesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flat'
    }]
});

const UserFavorites = mongoose.model('UserFavorites', userFavoritesSchema);

module.exports = UserFavorites;

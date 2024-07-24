const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const flatSchema = new Schema({
    city: {
        type: String,
        required: true
    },
    streetName: {
        type: String,
        required: true
    },
    streetNumber: {
        type: String,
        required: true
    },
    areaSize: {
        type: Number,
        required: true
    },
    hasAc: {
        type: Boolean,
        required: true
    },
    yearBuilt: {
        type: Number,
        required: true
    },
    rentPrice: {
        type: Number,
        required: true
    },
    dateAvailable: {
        type: Date,
        required: true
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    created: {
        type: Date,
        default: Date.now,
        required: true
    },
    updated: {
        type: Date,
        default: Date.now,
        required: true
    }
});

const Flat = mongoose.model('Flat', flatSchema);

module.exports = Flat;

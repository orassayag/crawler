const mongoose = require('mongoose');

const emailAddress = mongoose.model('emailaddress', new mongoose.Schema({
    emailAddress: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }
}));

module.exports = emailAddress;
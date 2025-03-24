const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

module.exports = {
    User,
    userSchema,
}


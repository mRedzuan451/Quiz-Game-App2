// quiz-game-backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: { // 'guest', 'registered', 'game-master', 'admin'
        type: String,
        default: 'registered',
        enum: ['guest', 'registered', 'game-master', 'admin']
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    gameHistory: [{
        gameId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        },
        score: Number,
        playedAt: {
            type: Date,
            default: Date.now
        }
    }],
    achievements: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
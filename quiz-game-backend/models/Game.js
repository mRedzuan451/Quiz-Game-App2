// quiz-game-backend/models/Game.js
const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    gameCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
        // You might want to generate this randomly and ensure uniqueness
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mode: { // 'adult' or 'kids'
        type: String,
        required: true,
        enum: ['adult', 'kids']
    },
    status: { // 'waiting', 'in-progress', 'completed', 'paused'
        type: String,
        default: 'waiting',
        enum: ['waiting', 'in-progress', 'completed', 'paused']
    },
    players: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String, // Denormalize for quick access
        score: {
            type: Number,
            default: 0
        },
        socketId: String // To link to their active WebSocket connection
    }],
    currentQuestionIndex: {
        type: Number,
        default: 0
    },
    questions: [{ // Array of question IDs for the current game
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    rounds: {
        type: Number,
        default: 10
    },
    timePerQuestion: {
        type: Number, // seconds
        default: 30
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date
    }
});

module.exports = mongoose.model('Game', GameSchema);
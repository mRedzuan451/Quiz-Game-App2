// quiz-game-backend/models/Question.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
        trim: true
    },
    questionType: { // e.g., 'multiple-choice', 'true-false', 'fill-in-the-blank', 'image-based'
        type: String,
        required: true,
        enum: ['multiple-choice', 'true-false', 'fill-in-the-blank', 'image-based']
    },
    category: { // e.g., 'general-knowledge', 'history', 'animals', 'basic-math'
        type: String,
        required: true
    },
    difficulty: { // e.g., 'easy', 'medium', 'hard'
        type: String,
        required: true,
        enum: ['easy', 'medium', 'hard']
    },
    mode: { // 'adult' or 'kids'
        type: String,
        required: true,
        enum: ['adult', 'kids']
    },
    options: { // For multiple-choice questions
        type: [String],
        default: []
    },
    correctAnswer: {
        type: mongoose.Schema.Types.Mixed, // Can be String or Array for fill-in-the-blank (multiple correct answers)
        required: true
    },
    imageUrl: { // For image-based questions
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Question', QuestionSchema);
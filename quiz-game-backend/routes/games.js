// quiz-game-backend/routes/games.js
const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const Question = require('../models/Question');
const { protect, authorize } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');
const generateUniqueGameCode = require('../utils/gameCodeGenerator'); // We'll create this

// @desc    Create a new game
// @route   POST /api/games
// @access  Private (Game Master)
router.post('/', protect, authorize(['game-master', 'admin']), asyncHandler(async (req, res) => {
    const { mode, rounds, timePerQuestion } = req.body;

    if (!mode || !rounds || !timePerQuestion) {
        res.status(400);
        throw new Error('Please provide mode, rounds, and time per question');
    }

    // Generate a unique game code
    const gameCode = await generateUniqueGameCode();

    // Fetch questions based on mode and a mix of difficulties/categories
    // For simplicity, let's just grab a random set for now.
    // In a real app, you'd implement more sophisticated question selection.
    const questions = await Question.aggregate([
        { $match: { mode: mode } },
        { $sample: { size: rounds } } // Get 'rounds' number of random questions
    ]);

    if (questions.length < rounds) {
        res.status(400);
        throw new Error(`Not enough questions available for ${mode} mode to create a game with ${rounds} rounds.`);
    }

    const game = await Game.create({
        gameCode,
        host: req.user._id, // req.user is set by protect middleware
        mode,
        rounds,
        timePerQuestion,
        questions: questions.map(q => q._id)
    });

    res.status(201).json(game);
}));

// @desc    Get game by code (for joining)
// @route   GET /api/games/:gameCode
// @access  Public (Guest/Registered Player)
router.get('/:gameCode', asyncHandler(async (req, res) => {
    const game = await Game.findOne({ gameCode: req.params.gameCode })
        .populate('host', 'username') // Populate host details
        .populate('questions', 'questionText options questionType imageUrl'); // Populate question details for game master/display

    if (game) {
        // Depending on game status, you might send different data
        // For players, we might initially send only basic game info and not all questions immediately
        res.json(game);
    } else {
        res.status(404);
        throw new Error('Game not found or invalid game code');
    }
}));


module.exports = router;
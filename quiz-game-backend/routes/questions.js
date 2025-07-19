// quiz-game-backend/routes/questions.js
const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { protect, authorize } = require('../middleware/authMiddleware'); // We'll create this
const asyncHandler = require('express-async-handler');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Private (Admin/Game Master)
router.get('/', protect, authorize(['admin', 'game-master']), asyncHandler(async (req, res) => {
    const questions = await Question.find({});
    res.json(questions);
}));

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Private (Admin/Game Master)
router.get('/:id', protect, authorize(['admin', 'game-master']), asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);
    if (question) {
        res.json(question);
    } else {
        res.status(404);
        throw new Error('Question not found');
    }
}));

// @desc    Create a question
// @route   POST /api/questions
// @access  Private (Admin)
router.post('/', protect, authorize(['admin']), asyncHandler(async (req, res) => {
    const question = await Question.create(req.body);
    res.status(201).json(question);
}));

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private (Admin)
router.put('/:id', protect, authorize(['admin']), asyncHandler(async (req, res) => {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (question) {
        res.json(question);
    } else {
        res.status(404);
        throw new Error('Question not found');
    }
}));

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize(['admin']), asyncHandler(async (req, res) => {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (question) {
        res.json({ message: 'Question removed' });
    } else {
        res.status(404);
        throw new Error('Question not found');
    }
}));

// @desc    Bulk upload questions (Placeholder - requires CSV/Excel parsing logic)
// @route   POST /api/questions/bulk-upload
// @access  Private (Admin)
router.post('/bulk-upload', protect, authorize(['admin']), asyncHandler(async (req, res) => {
    // This endpoint would parse a CSV/Excel file from req.body or req.files
    // and insert multiple questions into the database.
    // You'd need a library like 'csv-parser' or 'xlsx' for this.
    res.status(501).json({ message: 'Bulk upload not yet implemented. Requires file parsing logic.' });
}));


module.exports = router;
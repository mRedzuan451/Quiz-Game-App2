// quiz-game-backend/utils/gameCodeGenerator.js
const Game = require('../models/Game');

const generateUniqueGameCode = async () => {
    let gameCode;
    let isUnique = false;

    while (!isUnique) {
        // Generate a 6-character alphanumeric code
        gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const existingGame = await Game.findOne({ gameCode });
        if (!existingGame) {
            isUnique = true;
        }
    }
    return gameCode;
};

module.exports = generateUniqueGameCode;
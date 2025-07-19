// quiz-game-backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // We'll create this soon
const http = require('http'); // For Socket.IO
const { Server } = require('socket.io');
const path = require('path'); // For serving static files in production

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' ? null : 'http://localhost:3000', // Allow frontend origin
        methods: ["GET", "POST"]
    }
});

// Body parser middleware
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const gameRoutes = require('./routes/games'); // For creating/joining games via REST

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/games', gameRoutes);

// Socket.IO logic (placeholder for now)
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinGame', (gameCode, userId, username) => {
        // Implement logic to add user to game room
        socket.join(gameCode);
        console.log(`${username} (ID: ${userId}) joined game ${gameCode}`);
        // Emit to all in the room that a player joined
        io.to(gameCode).emit('playerJoined', { userId, username, socketId: socket.id });
    });

    socket.on('submitAnswer', (data) => {
        // data: { gameCode, userId, questionId, answer, timeTaken }
        // Implement scoring logic, check answer, update game state
        console.log(`Answer submitted in game ${data.gameCode} by ${data.userId} for Q ${data.questionId}: ${data.answer}`);
        // Emit updated scores/feedback
        io.to(data.gameCode).emit('answerSubmitted', data);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Implement logic to remove user from game, update game state if host disconnects
    });
});


// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('quiz-game-frontend/build'));

    app.get('*', (req, res) =>
        res.sendFile(path.resolve(__dirname, 'quiz-game-frontend', 'build', 'index.html'))
    );
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
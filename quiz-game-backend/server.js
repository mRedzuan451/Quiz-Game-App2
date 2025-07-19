// quiz-game-backend/server.jsc
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // We'll create this soon
const http = require('http'); // For Socket.IO
const { Server } = require('socket.io');
const path = require('path'); // For serving static files in production
const cors = require('cors');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
app.use(cors({ // <--- ADD THIS BLOCK
    origin: process.env.NODE_ENV === 'production' ? null : 'http://localhost:3001', // Your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true // Allow cookies to be sent with requests
}));
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' ? null : 'http://localhost:3001', // Allow frontend origin
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

    socket.on('error', (err) => {
        console.error(`[Socket.IO Error] Socket ${socket.id} encountered an error:`, err);
    });

    socket.on('disconnect', (reason) => {
        console.log(`[Socket.IO] User disconnected: ${socket.id}. Reason: ${reason}`);
    });

    socket.on('joinGame', (gameCode, userId, username) => {
        console.log(`[Socket.IO] Received joinGame event from ${username} (${userId}) for game ${gameCode}`);
        try {
            // Ensure userId and username are not null/undefined here
            if (!userId || !username) {
                console.error(`[Socket.IO Error] Invalid userId or username received for joinGame: userId=${userId}, username=${username}`);
                socket.emit('joinGameError', 'Invalid user data provided.');
                socket.disconnect(true); // Disconnect client if data is bad
                return;
            }

            socket.join(gameCode);
            console.log(`[Socket.IO] ${username} (ID: ${userId}) joined game room ${gameCode}`);
            // Emit to all in the room that a player joined (including the sender for immediate feedback)
            io.to(gameCode).emit('playerJoined', { userId, username, socketId: socket.id });
            console.log(`[Socket.IO] Emitted 'playerJoined' to room ${gameCode}`);

        } catch (err) {
            console.error(`[Socket.IO Error] Error processing joinGame for ${username}:`, err);
            socket.emit('joinGameError', 'An internal server error occurred while joining game.');
            socket.disconnect(true); // Disconnect client on server error
        }
    });

    socket.on('submitAnswer', (data) => {
        // data: { gameCode, userId, questionId, answer, timeTaken }
        // Implement scoring logic, check answer, update game state
        console.log(`Answer submitted in game ${data.gameCode} by ${data.userId} for Q ${data.questionId}: ${data.answer}`);
        // Emit updated scores/feedback
        io.to(data.gameCode).emit('answerSubmitted', data);
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
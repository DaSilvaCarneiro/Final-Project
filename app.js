const mongoose = require('mongoose');
const express = require('express');
const userRouter = require('./routes/userRouter');
const flatRouter = require('./routes/flatRouter');
const messageRouter = require('./routes/messageRouter');
const favoriteRouter = require('./routes/favoritesRouter');
const authRouter = require('./routes/authRouter');


const app = express();

app.use(express.json());

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message
    });
});

app.use('', userRouter);
app.use('', flatRouter);
app.use('', messageRouter);
app.use('', favoriteRouter);
app.use('', authRouter);

let server;

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
}

function startServer() {
    server = app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}

async function closeServer() {
    if (server) {
        await server.close();
        console.log('Server closed');
    }
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
}

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);

connectToDatabase().then(startServer);


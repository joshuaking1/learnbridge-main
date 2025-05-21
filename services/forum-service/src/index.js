// services/forum-service/src/index.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { connectToDatabase } = require('./config/database');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/error-handler');

// Import routes
const categoryRoutes = require('./routes/category.routes');
const threadRoutes = require('./routes/thread.routes');
const postRoutes = require('./routes/post.routes');
const searchRoutes = require('./routes/search.routes');
const botRoutes = require('./routes/bot.routes');
const moderationRoutes = require('./routes/moderation.routes');
const gamificationRoutes = require('./routes/gamification.routes');
const mediaRoutes = require('./routes/media.routes');

// Initialize express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Routes
app.use('/api/forum-categories', categoryRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/media', mediaRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'forum-service' });
});

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    app.listen(PORT, () => {
      logger.info(`Forum service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
});

module.exports = app; // For testing purposes

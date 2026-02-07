require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/database');
const config = require('./config');

// Import models to ensure associations are set up
require('./models');

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    app.listen(config.port, () => {
      console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${config.port}`);
      console.log(`📍 API available at http://localhost:${config.port}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

startServer();

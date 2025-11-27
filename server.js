import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Import app after env vars are loaded
const { default: app } = await import('./api/index.js');

const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`✅ API Server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});

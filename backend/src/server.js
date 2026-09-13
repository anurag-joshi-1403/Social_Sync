require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');


// Connect to MongoDB
connectDB();

const app = express();

// ---------- Middleware ----------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ---------- Health Check ----------
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SocialSync API is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// ---------- Routes (added in later steps) ----------
app.use('/api/auth', require('./routes/auth'));
// app.use('/api/posts', require('./routes/posts'));
// app.use('/api/accounts', require('./routes/accounts'));
// app.use('/api/content', require('./routes/content'));

// ---------- 404 Handler ----------
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ---------- Global Error Handler ----------
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const contactRoutes = require('./src/routes/contact');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
const allowedOrigins = ['http://localhost:3000', 'https://intercanjes.com', 'https://api.intercanjes.com', 'https://www.intercanjes.com'];
const allowedOriginPatterns = [/^https?:\/\/(?:.+\.)?intercanjes\.com$/];
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    if (allowedOriginPatterns.some((re) => re.test(origin))) {
      return callback(null, true);
    }
    console.warn('CORS blocked Origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/contact', contactRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Never crash the app on unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


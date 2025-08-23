require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');

// Route modules
const authRoutes = require('./routes/auth');
const cowRoutes = require('./routes/cows');
const milkRoutes = require('./routes/milk');
const financeRoutes = require('./routes/finance');
const breedingRoutes = require('./routes/breeding');
const chatbotRoutes = require('./routes/chatbot');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Gosiri – Smart Dairy Management System' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/cows', cowRoutes);
app.use('/api/milk', milkRoutes);
app.use('/api/finance', financeRoutes );
app.use('/api/breeding', breedingRoutes);
app.use('/api/chatbot', chatbotRoutes);

const PORT = process.env.PORT || 5000;

// Start server after DB connects
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Gosiri backend listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });



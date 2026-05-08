const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const fieldRoutes = require('./routes/field.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error',
    data: {}
  });
});

module.exports = app;

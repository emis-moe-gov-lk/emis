const express = require('express');
const helmetMiddleware = require('./middleware/helmet');
const corsMiddleware = require('./middleware/cors');
const { global: globalLimiter, health: healthLimiter } = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const alertRoutes = require('./routes/alertRoutes');
const eventRoutes = require('./routes/eventRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// 1. Security headers — first, always
app.use(helmetMiddleware);

// 2. CORS
app.use(corsMiddleware);

// 3. Global rate limiter
app.use(globalLimiter);

// 4. Body parser
app.use(express.json());

// 5. Request logger
app.use(requestLogger);

// 6. Health check (public, no auth)
app.get('/health', healthLimiter, (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'alert-service',
      timestamp: new Date().toISOString(),
    },
  });
});

// 7. Routes
app.use('/api/alerts', alertRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);

// 8. 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found.' } });
});

// 9. Error handler — last
app.use(errorHandler);

module.exports = app;

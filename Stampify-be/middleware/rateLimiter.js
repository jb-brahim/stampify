const rateLimit = require('express-rate-limit');

// Rate limiter for scan endpoint - 1 stamp per 10 seconds per IP
const scanRateLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 1, // limit each IP to 1 request per windowMs
  message: {
    success: false,
    message: 'Too many scan requests. Please wait 10 seconds before scanning again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

module.exports = {
  scanRateLimiter,
  apiRateLimiter
};


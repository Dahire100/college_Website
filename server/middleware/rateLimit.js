const rateLimit = require('express-rate-limit');

// General API Rate Limiter (Protects overall endpoints from spam/DDoS)
// Allows up to 120 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120,
  standardHeaders: true, // Return standard RateLimit headers in response
  legacyHeaders: false, // Disable X-RateLimit headers
  message: {
    success: false,
    message: 'Too many requests from this IP. Please wait a moment and try again.'
  }
});

// Stricter Rate Limiter for Authentication (Prevents brute-force login attempts)
// Allows up to 10 attempts every 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});

// Inquiry / Contact Form Rate Limiter (Prevents automated form submission spam)
// Allows up to 5 inquiry submissions per 10 minutes per IP
const inquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many inquiry submissions from this IP. Please wait a few minutes before submitting again.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  inquiryLimiter
};

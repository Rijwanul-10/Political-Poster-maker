import rateLimit from 'express-rate-limit';

/**
 * Rate limiter middleware for poster generation and regeneration endpoints.
 * Protects server resources (Puppeteer rendering & Gemini API calls).
 * Limits to 15 generation calls per 15-minute window per authenticated user (or IP).
 */
export const generationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Max 15 poster generation requests per window
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false },
  keyGenerator: (req: any) => {
    return req.user?._id ? req.user._id.toString() : (req.ip || '127.0.0.1');
  },
  handler: (req, res) => {
    res.status(429).json({
      error:
        'পোস্টার তৈরির অনুরোধের সীমা অতিক্রান্ত হয়েছে। অনুগ্রহ করে ১৫ মিনিট পর পুনরায় চেষ্টা করুন। (Rate limit reached: Max 15 poster generations per 15 minutes. Please try again shortly.)',
      retryAfterMinutes: 15,
    });
  },
});

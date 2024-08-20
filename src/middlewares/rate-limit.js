const { rateLimit } = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100, // Headers => x-ratelimit-limit : 100
  message: { message: `too many request in a given period` },
}); //TestShotAPIs => status(429) => "message": "too many request in a given period"

module.exports = limiter;

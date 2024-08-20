const Joi = require("joi");

exports.borrowingBook = Joi.object({
  userId: Joi.number(),
  bookId: Joi.number(),
});

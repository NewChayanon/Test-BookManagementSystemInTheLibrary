const Joi = require("joi");

exports.borrowingBook = Joi.object({
  userId: Joi.number().required(),
  bookId: Joi.number().required(),
});

exports.returnBookParams = Joi.object({
  borrowingId: Joi.number().required(),
});
exports.returnBookBody = Joi.object({
  userId: Joi.number().required(),
});

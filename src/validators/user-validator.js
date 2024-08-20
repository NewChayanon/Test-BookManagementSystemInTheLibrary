const Joi = require("joi");

exports.borrowingBook = Joi.object({
  userId: Joi.number().required(),
  bookId: Joi.number().required(),
});

exports.returnBook = Joi.object({
  userId: Joi.number().required(),
  bookId: Joi.number().required(),
});

const Joi = require("joi");

exports.createBook = Joi.object({
  title: Joi.string().required(),
  detail: Joi.string().required(),
  author: Joi.string().required(),
  category: Joi.string().required(),
});

exports.editBook = Joi.object({
  title: Joi.string(),
  detail: Joi.string(),
  author: Joi.string(),
  category: Joi.string(),
});

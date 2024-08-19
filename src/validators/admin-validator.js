const Joi = require("joi");

exports.createBook = Joi.object({
    title: Joi.string().required(),
    detail: Joi.string().required(),
    author: Joi.string().required(),
    category: Joi.string().required(),
  });
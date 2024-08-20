const Joi = require("joi");

exports.register = Joi.object({
  email: Joi.string()
    .required()
    .email({ tlds: { allow: ["com", "net"] } }),
  password: Joi.string()
    .required()
    .pattern(/^[a-zA-Z0-9]{8,}$/),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")).strip(),
});

exports.login = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

exports.searchBook = Joi.object({
  title: Joi.string(),
  author: Joi.string(),
  category: Joi.string(),
});
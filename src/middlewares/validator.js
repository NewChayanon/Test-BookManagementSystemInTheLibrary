const { createError } = require("../utils/createError");
const { register, login } = require("../validators/auth-validator");

exports.registerValidator = (req, res, next) => {
  const { value, error } = register.validate(req.body);
  if (error) {
    createError(400, error.details[0].message);
  }
  req.input = value;
  next();
};

exports.loginValidator = (req, res, next) => {
  const { value, error } = login.validate(req.body);
  if (error) {
    createError(400, error.details[0].message);
  }
  req.input = value;
  next();
};

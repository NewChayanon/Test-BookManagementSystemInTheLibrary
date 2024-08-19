const { createError } = require("../utils/createError");
const { createBook, editBook } = require("../validators/admin-validator");
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

exports.createBookValidator = (req, res, next) => {
  const { value, error } = createBook.validate(req.body);
  if (error) {
    createError(400, error.details[0].message);
  }
  req.book = value;
  next();
};

exports.editBookValidator = (req, res, next) => {
  const { value, error } = editBook.validate(req.body);
  if (error) {
    createError(400, error.details[0].message);
  }
  req.book = value;
  next();
};

const { createError } = require("../utils/createError");
const { createBook, editBook } = require("../validators/admin-validator");
const { register, login, searchBook } = require("../validators/auth-validator");
const { borrowingBook } = require("../validators/user-validator");

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

exports.searchBookValidator = (req, res, next) => {
  const { value, error } = searchBook.validate(req.query);
  if (error) {
    createError(400, error.details[0].message);
  }
  req.book = value;
  next();
};

exports.borrowingBookValidator = (req, res, next) => {
  const { value, error } = borrowingBook.validate(req.body);
  if (error) {
    createError(400, error.details[0].message);
  }
  req.borrowing = value;
  next();
}

exports.returnBookValidator = (req, res, next) => {
  const { valueParams, errorParams } = returnBookParams.validate(req.params);
  if (errorParams) {
    createError(400, errorParams.details[0].message);
  }

  const { valueBody, errorBody } = returnBookBody.validate(req.body);
  if (errorBody) {
    createError(400, errorBody.details[0].message);
  }

  req.borrowing = value;
  next();
}
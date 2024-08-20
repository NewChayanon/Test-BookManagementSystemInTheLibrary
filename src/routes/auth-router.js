const express = require("express");
const {
  registerValidator,
  loginValidator,
  searchBookValidator,
} = require("../middlewares/validator");
const authController = require("../controllers/auth-controller");
const authRouter = express.Router();

authRouter.post("/register", registerValidator, authController.register);
authRouter.post("/login", loginValidator, authController.login);
authRouter.get("/books/:bookId", authController.getBook);
authRouter.get("/books", searchBookValidator,authController.searchBooks);

module.exports = authRouter;

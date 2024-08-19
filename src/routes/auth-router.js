const express = require("express");
const { registerValidator, loginValidator } = require("../middlewares/validator");
const authController = require("../controllers/auth-controller");
const authRouter = express.Router();

authRouter.post("/register", registerValidator, authController.register);
authRouter.post("/login", loginValidator,authController.login)

module.exports = authRouter;

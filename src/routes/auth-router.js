const express = require("express");
const { registerValidator } = require("../middlewares/validator");
const authController = require("../controllers/auth-controller");
const authRouter = express.Router();

authRouter.post("/register",registerValidator,authController.register)

module.exports = authRouter;
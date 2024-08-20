const express = require("express");
const userController = require("../controllers/user-controller");
const { borrowing } = require("../models/prisma");
const { borrowingBookValidator, returnBookValidator } = require("../middlewares/validator");
const userRouter = express.Router();

userRouter.get("/refresh-token", userController.refreshToken);
userRouter.post("/borrowings", borrowingBookValidator,userController.borrowingBook);
userRouter.post("/borrowings/:borrowingId/return", returnBookValidator);

module.exports = userRouter;

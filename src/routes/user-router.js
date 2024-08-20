const express = require("express");
const userController = require("../controllers/user-controller");
const { borrowingBookValidator, returnBookValidator } = require("../middlewares/validator");
const userRouter = express.Router();

userRouter.get("/refresh-token", userController.refreshToken);
userRouter.post("/borrowings", borrowingBookValidator,userController.borrowingBook);
userRouter.post("/borrowings/:bookId/return", returnBookValidator,userController.returnBook);

module.exports = userRouter;

const express = require('express');
const userController = require('../controllers/user-controller');
const userRouter = express.Router();

userRouter.get("/refresh-token",userController.refreshToken)

module.exports = userRouter;
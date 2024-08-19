const express = require('express');
const { createBookValidator } = require('../middlewares/validator');
const adminController = require('../controllers/admin-controller');
const adminRouter = express.Router();

adminRouter.post("/books",createBookValidator,adminController.createBook)

module.exports = adminRouter;
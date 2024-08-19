const express = require('express');
const { createBookValidator, editBookValidator } = require('../middlewares/validator');
const adminController = require('../controllers/admin-controller');
const adminRouter = express.Router();

adminRouter.post("/books",createBookValidator,adminController.createBook)
adminRouter.put("/books/:bookId",editBookValidator,adminController.editBook)

module.exports = adminRouter;
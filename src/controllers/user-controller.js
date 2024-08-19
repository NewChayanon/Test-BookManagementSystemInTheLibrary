const jwtService = require("../services/jwt-service");

const userController = {};

userController.refreshToken = async (req, res, next) => {
  try {
    const accessToken = jwtService.sign({ id: req.user.id });
    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

module.exports = userController;

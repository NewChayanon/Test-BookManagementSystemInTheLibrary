const jwtService = require("../services/jwt-service");
const userService = require("../services/user-service");
const { createError } = require("../utils/createError");

exports.authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer "))
      createError(401, "unauthenticated");

    const accessToken = authorization.split(" ")[1];
    const payload = jwtService.verify(accessToken);
    const searchUser = await userService.findUserById(payload.id);

    if (!searchUser) createError(401, "unauthenticated");
    delete searchUser.password;
    req.user = searchUser;
    next();
  } catch (error) {
    next(error);
  }
};

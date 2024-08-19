const roleService = require("../services/role-service");
const { createError } = require("../utils/createError");

exports.isAdmin = async (req, res, next) => {
  try {
    const user = req.user;
    
    const role = await roleService.findRoleById(user.roleId);
    if (role.name !== "ADMIN")
      createError(403, "You are not authorized to access this resource.");

    next();
  } catch (error) {
    next(error);
  }
};

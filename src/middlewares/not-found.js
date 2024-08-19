exports.notFoundMiddleware = (req, res, next) => {
    res.status(404).json({
      msg: `requested url: ${req.method} ${req.url} was not found on this server`,
    });
  };
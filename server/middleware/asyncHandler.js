// Wraps an async route handler so any thrown error / rejected promise is forwarded
// to Express's error middleware instead of crashing the process or hanging the request.
// Lets route handlers drop their repetitive try/catch blocks.
module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

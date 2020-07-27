const createError = (message, statusCode) => {
  const error = new Error(message);
  error.status = statusCode;
  return error;
};

module.exports = createError;

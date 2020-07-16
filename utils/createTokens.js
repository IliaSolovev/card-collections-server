const SECRET_KEYS = require('../secretKeys');
const jwt = require("jsonwebtoken");

const createTokens = ( id, login ) => {
  const accessToken = jwt.sign({ id: id, login: login }, SECRET_KEYS.SECRET_ACCESS_KEY, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign({ id, login }, SECRET_KEYS.SECRET_REFRESH_KEY, {
    expiresIn: "1w",
  });
  return { accessToken, refreshToken }
}

module.exports = createTokens;
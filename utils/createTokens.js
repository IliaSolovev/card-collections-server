const SECRET_KEYS = require('../secretKeys');
const jwt = require("jsonwebtoken");

const createTokens = ( id ) => {
  const accessToken = jwt.sign({ id: id,  }, SECRET_KEYS.SECRET_ACCESS_KEY, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign({ id }, SECRET_KEYS.SECRET_REFRESH_KEY, {
    expiresIn: "1w",
  });
  return { accessToken, refreshToken }
}

module.exports = createTokens;
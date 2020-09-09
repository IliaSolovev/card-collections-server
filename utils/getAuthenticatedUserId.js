const jwt = require('jsonwebtoken');
const SECRET_KEYS = require('../secretKeys')

module.exports = ( token ) => {
  if ( !token || token === '' ) {
    return null;
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, SECRET_KEYS.SECRET_ACCESS_KEY);
  } catch (err) {
    return null;
  }
  if ( !decodedToken ) {
    return null;
  }
  return decodedToken.id
};
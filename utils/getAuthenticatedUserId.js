const jwt = require('jsonwebtoken');
const SECRET_KEY = require('../secret')

module.exports = ( authHeader ) => {
  if ( !authHeader ) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  if ( !token || token === '' ) {
    return null;
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
  if ( !decodedToken ) {
    return null;
  }
  return decodedToken.id
};
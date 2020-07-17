const cookie = require("cookie");

module.exports = ( accessToken, refreshToken, res ) => {
  res.setHeader(
    "Set-Cookie",
    [
      cookie.serialize("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 3600,
        path: "/",
      }), cookie.serialize("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 25200,
      path: "/",
    })
    ]
  );
}
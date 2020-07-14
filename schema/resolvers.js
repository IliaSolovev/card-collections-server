const { compare, hash } = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const SECRET_KEY = require("../secret");
const User = require("../models/user");

module.exports = {
  Query: {
    getUser: () => {
      return User.findById("5f0d73eea63635e0bc6a6e58");
    },
    login: async (_, { login, password }, { res }) => {
      const user = await User.findOne({ login });

      if (!user) {
        throw new Error("User does not exist!");
      }
      const isEqual = await compare(password, user.password);
      if (!isEqual) {
        throw new Error("Password is incorrect!");
      }
      const token = jwt.sign({ id: user.id, login: user.login }, SECRET_KEY, {
        expiresIn: "1h",
      });
      res.setHeader(
        "Set-Cookie",
        cookie.serialize("token", token, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 3600,
          path: "/",
        })
      );

      return { id: user.id };
    },
  },
  Mutation: {
    registerUser: async (_, { login, password }) => {
      try {
        const existingUser = await User.findOne({ login });

        if (existingUser) {
          throw new Error("User exists already.");
        }
        const hashedPassword = await hash(password, 12);
        const user = new User({
          login,
          password: hashedPassword,
        });

        const result = await user.save();

        return { id: result.id, login: user.login };
      } catch (err) {
        throw err;
      }
    },
  },
};

const { compare, hash } = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const SECRET_KEY = require("../secret");
const User = require("../models/user");
const SpiderManHeroesAndVillainsPart1 = require("../models/spider-man-heroes-and-villains-part-1");
module.exports = {
  Query: {
    getUser: ( _, __, context ) => {
      return User.findById("5f0e02f09cd4921430b102a3");
    },
    login: async ( _, { login, password }, { res } ) => {
      const user = await User.findOne({ login });

      if ( !user ) {
        throw new Error("User does not exist!");
      }
      const isEqual = await compare(password, user.password);
      if ( !isEqual ) {
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
    logout: ( _, __, { res, userAuthId } ) => {

      res.setHeader(
        "Set-Cookie",
        cookie.serialize("token", '', {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 3600,
          path: "/",
        })
      );

      return userAuthId
    },
    getSpiderManCards: async ( _, { from, limit, collectionPart }, { userAuthId } ) => {
      const currentUser = await User.findById(userAuthId);
      if(!currentUser) {
        throw new Error("You are hasn`t access here")
      }
      return SpiderManHeroesAndVillainsPart1.find().sort( "number asc" ).skip(from - 1).limit(limit)
    },
  },
  Mutation: {
    registerUser: async ( _, { login, password } ) => {
      try {
        const existingUser = await User.findOne({ login });

        if ( existingUser ) {
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

const { compare, hash } = require("bcrypt");

const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");
const Collections = require("../models/collections");
const SpiderManHeroesAndVillainsPart1 = require("../models/spider-man-heroes-and-villains-part-1");
const createTokens = require('../utils/createTokens');
const setTokensIntoHeader = require('../utils/setTokensIntoHeader');

module.exports = {
  Query: {
    user: ( _, __, context ) => {
      return User.findById("5f0e02f09cd4921430b102a3");
    },

    logout: ( _, __, { res, userAuthId } ) => {

      res.setHeader(
        "Set-Cookie",
        cookie.serialize("accessToken", '', {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 3600,
          path: "/",
        })
      );

      return userAuthId
    },
    spiderManCards: async ( _, { from, limit, collectionPart }, { userAuthId } ) => {
      const currentUser = await User.findById(userAuthId);
      if ( !currentUser ) {
        const error = new Error("You are hasn`t access here!");
        error.status = 403;
        throw error;
      }
      return SpiderManHeroesAndVillainsPart1.find().sort("number asc").skip(from - 1).limit(limit)
    },
    cardCollections: () => {
      return Collections.find();
    }
  },
  Mutation: {
    registerUser: async ( _, { login, password } ) => {
      const existingUser = await User.findOne({ login });

      if ( existingUser ) {
        const error = new Error("User exists already!");
        error.status = 403;
        throw error;
      }
      const hashedPassword = await hash(password, 12);
      const user = new User({
        login,
        password: hashedPassword,

      });
      const registeredUser = await user.save();

      const refreshToken = new RefreshToken({
        token: '',
        userId: registeredUser.id
      })
      await refreshToken.save();
      return { id: registeredUser.id, login: registeredUser.login };
    },
    login: async ( _, { login, password }, { res } ) => {
      const user = await User.findOne({ login });
      if ( !user ) {
        const error = new Error("User does not exist!");
        error.status = 403;
        throw error;
      }

      const isEqual = await compare(password, user.password);
      if ( !isEqual ) {
        const error = new Error("Password is incorrect!");
        error.status = 403;
        throw error;
      }

      const { accessToken, refreshToken } = createTokens(user.id, user.login);
      setTokensIntoHeader(accessToken, refreshToken, res);

      await RefreshToken.findOneAndUpdate({ userId: user.id}, {token: refreshToken});
      return { id: user.id };
    },
  }
};

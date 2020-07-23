const { compare, hash } = require("bcrypt");

const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");
const Collections = require("../models/collections");
const CardsModels = require("../models/cards");
const ConfirmToken = require("../models/confirmToken");
const createTokens = require('../utils/createTokens');
const setTokensIntoHeader = require('../utils/setTokensIntoHeader');
const getAuthenticatedUserId = require('../utils/getAuthenticatedUserId')

module.exports = {
  CardCollection: {
    cards: ({cardCollectionName}) => {
      return CardsModels[cardCollectionName].find().sort("number asc").limit(8)
    }
  },
  Query: {
    user: ( _, __, context ) => {
      return User.findById("5f0e02f09cd4921430b102a3");
    },

    logout: ( _, __, { req, res } ) => {
      const userAuthId = getAuthenticatedUserId(req.cookies.accessToken || "");
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
    cards: (_, {from, limit = 1, collectionName }) => {
      return CardsModels[collectionName].find().sort("number asc").skip(from - 1).limit(limit)
    },
    cardCollections: async (_, __, { req, res }) => {
      return Collections.find();
    },
    cardCollection: (_, {id}) => {
      return Collections.findById(id)
    }
  },
  Mutation: {
    registerUser: async ( _, { login, password, email } ) => {
      const existingUserByLogin = await User.findOne({ login });
      const existingUserByEmail = await User.findOne({ email });

      if ( existingUserByLogin ) {
        const error = new Error("User exists already!");
        error.status = 403;
        throw error;
      }

      if (existingUserByEmail) {
        const error = new Error("User with this email already exists");
        error.status = 403;
        throw error;
      }

      const hashedPassword = await hash(password, 12);
      const user = new User({
        login,
        password: hashedPassword,
        email,
        activeStatus: false
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

      if ( !user || !user.activeStatus ) {
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

      const { accessToken, refreshToken } = createTokens(user.id);
      setTokensIntoHeader(accessToken, refreshToken, res);

      await RefreshToken.findOneAndUpdate({ userId: user.id }, { token: refreshToken });
      return { id: user.id };
    },
    refreshToken: async ( _, __, { res, req } ) => {
      const userAuthId = getAuthenticatedUserId(req.cookies.accessToken || "");

      const token = await RefreshToken.findOne({ token: req.cookies.refreshToken })
      if ( !token ) {
        const error = new Error("Your refresh token expired");
        error.status = 401;
        throw error;
      }

      const { accessToken, refreshToken } = createTokens(userAuthId);
      setTokensIntoHeader(accessToken, refreshToken, res);

      await RefreshToken.findOneAndUpdate({ userId: userAuthId }, { token: refreshToken });
      return { id: userAuthId };
    },
    addCard: ( _, { number, name, rarity, role, imageUrl } ) => {
      const card = new CardsModels["spider-man-heroes-and-villains-part-1"]({
        number, name, rarity, role, imageUrl, need: 0, have: 0
      });
      return card.save();
    }
  }
};

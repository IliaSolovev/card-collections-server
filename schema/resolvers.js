const { compare, hash } = require("bcrypt");

const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");
const Collections = require("../models/collections");
const CardsModels = require("../models/cards");
const createTokens = require('../utils/createTokens');
const setTokensIntoHeader = require('../utils/setTokensIntoHeader');
const getAuthenticatedUserId = require('../utils/getAuthenticatedUserId')

module.exports = {
  CardCollection: {
    cards: ( { cardCollectionName } ) => {
      return CardsModels[cardCollectionName].find().limit(8)
    }
  },
  Query: {
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
    cards: ( _, { from, limit = 1, collectionName } ) => {
      return CardsModels[collectionName].find().skip(from - 1).limit(limit)
    },
    cardCollections: async ( _, __, { req, res } ) => {
      return Collections.find();
    },
    cardCollection: ( _, { id } ) => {
      return Collections.findById(id)
    },
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
    },
    // turtleTest: async ( _, { number, name, rarity, role, imageUrl } ) => {
    //   const returnRarity = (type) => {
    //     switch (type) {
    //       case "О":
    //         return "обычная"
    //       case "Р":
    //         return 'редкая'
    //       case "СР":
    //         return 'супер редкая'
    //       case "УР":
    //         return 'ультра редкая'
    //       default:
    //         return 'обычная'
    //     }
    //   }
    //   for( let i = 0; i < turtlesPart2.length; i++){
    //     const variables = {
    //       number: turtlesPart2[i].number,
    //       name: turtlesPart2[i].name,
    //       rarity: returnRarity(turtlesPart2[i].kind),
    //       role: turtlesPart2[i].type,
    //       imageUrl: `https://www.laststicker.ru/i/cards/274/${turtlesPart2[i].number}.jpg`,
    //       need: 0,
    //       have: 0
    //     }
    //     const res = new CardsModels[""](variables)
    //
    //     await res.save();
    //   }
    //
    //   return { id: 'asd' }
    // }
  }
};

const { compare, hash } = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { createWriteStream } = require("fs");
const path = require("path");
const {
  GraphQLUpload, // The GraphQL "Upload" Scalar
} = require("graphql-upload");

const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");
const Collections = require("../models/collections");
const CardsModels = require("../models/cards");
const ConfirmToken = require("../models/confirmToken");
const ResetPasswordToken = require("../models/resetPasswordToken");
const createTokens = require("../utils/createTokens");
const setTokensIntoHeader = require("../utils/setTokensIntoHeader");
const getAuthenticatedUserId = require("../utils/getAuthenticatedUserId");
const {
  sendAuthorizationMessage,
  sendResetPasswordMessage,
} = require("../utils/sendAuthorizationMessage");
const createError = require("../utils/createError");

module.exports = {
  Upload: GraphQLUpload,
  CardCollection: {
    cards: ({ cardCollectionName }) => {
      return CardsModels[cardCollectionName].find().sort("number asc").limit(8);
    },
  },
  Query: {
    user: async (_, { id }) => {
      try {
        const user = await User.findById(id);

        return user;
      } catch (e) {
        throw createError("User does not exist", 403);
      }
    },
    logout: (_, __, { req, res }) => {
      const userAuthId = getAuthenticatedUserId(req.cookies.accessToken || "");
      res.setHeader(
        "Set-Cookie",
        cookie.serialize("accessToken", "", {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 3600,
          path: "/",
        })
      );

      return userAuthId;
    },
    cards: (_, { from, limit = 1, collectionName }) => {
      return CardsModels[collectionName]
        .find()
        .sort("number asc")
        .skip(from - 1)
        .limit(limit);
    },
    cardCollections: async (_, __, { req, res }) => {
      return Collections.find();
    },
    cardCollection: (_, { id }) => {
      return Collections.findById(id);
    },
  },
  Mutation: {
    registerUser: async (_, { login, password, email }) => {
      try {
        const existingUserByLogin = await User.findOne({ login });
        const existingUserByEmail = await User.findOne({ email });

        if (existingUserByLogin) {
          throw createError("User exists already!", 403);
        }

        if (existingUserByEmail) {
          throw createError("User with this email already exists", 403);
        }

        const hashedPassword = await hash(password, 12);
        const user = new User({
          login,
          password: hashedPassword,
          email,
          confirmed: false,
          avatarUrl: "",
        });
        const registeredUser = await user.save();
        const refreshToken = new RefreshToken({
          token: "",
          userId: registeredUser.id,
        });
        await refreshToken.save();
        const confirmToken = uuidv4();
        const confirmTokenDocument = new ConfirmToken({
          token: confirmToken,
          userId: registeredUser.id,
        });
        confirmTokenDocument.save();
        await sendAuthorizationMessage(confirmToken, email);
        return {
          id: registeredUser.id,
          login: registeredUser.login,
          email: registeredUser.email,
        };
      } catch (e) {
        throw e;
      }
    },
    login: async (_, { login, password }, { res }) => {
      const user = await User.findOne({ login });

      if (!user || !user.confirmed) {
        throw createError("User does not exist!", 403);
      }

      const isEqual = await compare(password, user.password);
      if (!isEqual) {
        throw createError("Password is incorrect!", 403);
      }

      const { accessToken, refreshToken } = createTokens(user.id);
      setTokensIntoHeader(accessToken, refreshToken, res);

      await RefreshToken.findOneAndUpdate(
        { userId: user.id },
        { token: refreshToken }
      );
      return { id: user.id };
    },
    refreshToken: async (_, __, { res, req }) => {
      const userAuthId = getAuthenticatedUserId(req.cookies.accessToken || "");

      const token = await RefreshToken.findOne({
        token: req.cookies.refreshToken,
      });
      if (!token) {
        throw createError("Your refresh token expired", 403);
      }

      const { accessToken, refreshToken } = createTokens(userAuthId);
      setTokensIntoHeader(accessToken, refreshToken, res);

      await RefreshToken.findOneAndUpdate(
        { userId: userAuthId },
        { token: refreshToken }
      );
      return { id: userAuthId };
    },
    addCard: (_, { number, name, rarity, role, imageUrl }) => {
      const card = new CardsModels["spider-man-heroes-and-villains-part-1"]({
        number,
        name,
        rarity,
        role,
        imageUrl,
        need: 0,
        have: 0,
      });
      return card.save();
    },
    confirmUser: async (_, { token }) => {
      try {
        const existedToken = await ConfirmToken.findOne({ token });

        if (!existedToken) {
          throw createError("This token does not exist!", 403);
        }
        await User.findByIdAndUpdate(existedToken.userId, { confirmed: true });
        await ConfirmToken.findOneAndRemove({ token });
        return { id: existedToken.userId };
      } catch (e) {
        throw e;
      }
    },
    resetPasswordMessage: async (_, { email }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          throw createError("Can`t find user with this email!", 403);
        }
        const token = uuidv4();
        await sendResetPasswordMessage(token, email);
        const resetPasswordTokenDocument = await new ResetPasswordToken({
          token,
          userId: user.id,
        });
        await resetPasswordTokenDocument.save();
        return { id: user.id };
      } catch (e) {
        throw e;
      }
    },
    resetPassword: async (_, { token, newPassword }) => {
      try {
        const existedToken = await ResetPasswordToken.findOne({ token });

        if (!existedToken) {
          throw createError("This token does not exist!", 403);
        }
        const hashedPassword = await hash(newPassword, 12);
        await User.findByIdAndUpdate(existedToken.userId, {
          password: hashedPassword,
        });
        await ResetPasswordToken.findOneAndRemove({ token });
        return { id: existedToken.userId };
      } catch (e) {
        throw e;
      }
    },
    setAvatar: async (_, { id, avatar }) => {
      try {
        const { createReadStream, filename } = await avatar;
        const nameAvatar = new Date().toISOString() + "-" + filename;

        await new Promise((resolve) => {
          createReadStream()
            .pipe(
              createWriteStream(path.join(__dirname, "../images", nameAvatar))
            )
            .on("close", resolve);
        }); // не идет дальше

        await User.findByIdAndUpdate(id, { avatarUrl: nameAvatar });
        return { id };
      } catch (e) {
        throw e;
      }
    },
  },
};

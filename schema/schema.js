const graphql = require('graphql');
const hash = require('bcrypt').hash;
const jwt = require('jsonwebtoken');
const secretKey = require('../secret')
const cookie  =  require('cookie');
const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLFloat } = graphql;

const User = require('../models/user');

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    login: { type: GraphQLString },
    password: { type: GraphQLString },
  }),
});

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      async resolve( parent, { id } ) {
        const result = await User.findById(id);
        return { id: result.id, login: result.login, password: null }
      },
    },
    login: {
      type: UserType,
      args: { login: { type: GraphQLString }, password: { type: GraphQLString } },
      async resolve( parent, { login, password }, context ) {
        const user = await User.find({ login });
        if (!user) {
          throw new Error('User does not exist!');
        }
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            throw new Error('Password is incorrect!');
          }
          const token = jwt.sign(
            { id: user.id, login: user.login },
            secretKey,
            {
              expiresIn: '1h'
            }
          );
          context.req.setHeader('Set-Cookie', cookie.serialize('auth', jwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 3600,
            path: '/'
          }))
        });
        return { id: user.id };
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    addUser: {
      type: UserType,
      args: {
        login: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve( parent, { login, password }, context) {
        try {
          const existingUser = await User.find({ login });
          if ( existingUser ) {
            throw new Error('User exists already.');
          }
          const hashedPassword = await hash(password, 12);
          const user = new User({
            login,
            password: hashedPassword,
          });

          const result = await user.save();

          return { id: result.id, password: null };
        } catch (err) {
          throw err;
        }

      }
    }
  })
})

module.exports = new GraphQLSchema({
  query: Query,
  mutation: Mutation
});

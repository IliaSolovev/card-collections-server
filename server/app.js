const typeDefs  = require('../schema/typeDefs');
const resolvers = require('../schema/resolvers');
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server');

const password = '43kusKdPlDqE22am';
const dbName = 'cards';
mongoose.connect(`mongodb+srv://ilya:${password}@cluster0.fyz4t.mongodb.net/${dbName}?retryWrites=true&w=majority`, { useNewUrlParser: true,useUnifiedTopology: true  });

const server = new ApolloServer({ typeDefs, resolvers });

const dbConnection = mongoose.connection;
dbConnection.on('error', err => console.log(`Connection error: ${err}`));
dbConnection.once('open', () => console.log('Connected to DB!'));

server.listen(4001).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
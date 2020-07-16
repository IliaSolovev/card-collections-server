const mongoose = require("mongoose");
const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const cors = require("cors")
const cookieParser = require('cookie-parser')

const typeDefs = require("../schema/typeDefs");
const resolvers = require("../schema/resolvers");

const password = "43kusKdPlDqE22am";
const dbName = "cards";
mongoose.connect(
  `mongodb+srv://ilya:${password}@cluster0.fyz4t.mongodb.net/${dbName}?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser())

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000")
    return {
      req,
      res,
    };
  },
});

server.applyMiddleware({
  app
});

mongoose.set('useFindAndModify', false);
const dbConnection = mongoose.connection;
dbConnection.on("error", (err) => console.log(`Connection error: ${err}`));
dbConnection.once("open", () => console.log("Connected to DB!"));

app.listen({ port: 4001 }, () => {
  console.log(`🚀  Server ready at`)
})

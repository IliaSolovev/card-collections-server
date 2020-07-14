const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('../schema/schema');
const mongoose = require('mongoose');
const cors = require('cors');
const isAuth = require('../middleware/isAuth');

const app = express();
const PORT = 8080;
const password = '43kusKdPlDqE22am';
const dbName = 'cards';
mongoose.connect(`mongodb+srv://ilya:${password}@cluster0.fyz4t.mongodb.net/${dbName}?retryWrites=true&w=majority`, { useNewUrlParser: true,useUnifiedTopology: true  });

app.use(cors());
app.use(isAuth);

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,

}));

const dbConnection = mongoose.connection;
dbConnection.on('error', err => console.log(`Connection error: ${err}`));
dbConnection.once('open', () => console.log('Connected to DB!'));

app.listen(PORT, err => {
  err ? console.log(err) : console.log('Server started!');
});

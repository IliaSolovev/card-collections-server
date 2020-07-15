const { gql } = require('apollo-server-express');

module.exports = gql`
  type User {
      id: ID!
  }
  type RegisterResponse {
      id: ID!
      login: String!
  }
  type LoginResponse {
      id: ID!
  }
  type LogoutResponse {
      id: ID!
  }
  
  type SpiderManCard {
      id: ID!
      name: String!
      imageUrl: String!
      type: String!
      kind: String!
      need: Int!
      have: Int!
      number: Int!
  }
  
  type CardCollection {
      id: ID!,
      nameString: String!
      imageUrl: String
      cardsCount: Int!
      release: Int!
  }
  
  type Query {
    getUser: User!
    login(login: String!, password: String!): LoginResponse!
    logout: LogoutResponse!
    getSpiderManCards(from: Int!,limit: Int!, collectionPart: Int!): [SpiderManCard]!
    getCardCollections: [CardCollection]!  
  }
  type Mutation {
      registerUser(login: String!, password: String!): RegisterResponse!
  }
`
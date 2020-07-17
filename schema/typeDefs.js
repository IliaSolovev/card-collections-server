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
    id: ID!
    name: String!
    imageUrl: String
    cardsCount: Int!
    release: Int!
  }
  
  type Query {
    user: User!
    logout: LogoutResponse!
    spiderManCards(from: Int!,limit: Int, collectionPart: Int!): [SpiderManCard]!
    cardCollections: [CardCollection]!  
  }

  type Mutation {
    registerUser(login: String!, password: String!): RegisterResponse!
    login(login: String!, password: String!): LoginResponse!
    refreshToken: User!
  }
`;

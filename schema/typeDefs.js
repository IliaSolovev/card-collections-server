const { gql } = require('apollo-server-express');

module.exports = gql`
  type User {
    id: ID!
  }
  type RegisterResponse {
    id: ID!
    login: String!
    email: String!
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
    cardCollectionName: String!
    imageUrl: String
    cardsCount: Int!
    release: Int!,
    cards: [Card]
  }
  
  type Card {
      id: ID!
      name: String!
      imageUrl: String!
      role: String!
      rarity: String!
      need: Int!
      have: Int!
      number: Int!
  }
    
  type Query {
    user: User!
    logout: LogoutResponse!
    cardCollections: [CardCollection]!  
    cards(from: Int!, limit: Int!, collectionName: String! ): [Card]!
    cardCollection(id: ID): CardCollection! 
  }

  type Mutation {
    registerUser(login: String!, password: String!, email: String!): RegisterResponse!
    login(login: String!, password: String!): LoginResponse!
    refreshToken: User!
    addCard(number:Int!, name: String!, rarity: String!, role: String!, imageUrl: String!): Card!
    confirmUser(token: String!): User
    resetPasswordMessage(email: String!): User  
    resetPassword(token: String!, newPassword: String!): User  
  }
`;

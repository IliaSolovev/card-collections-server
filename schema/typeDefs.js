const { gql } = require('apollo-server-express');

module.exports = gql`
  scalar Upload

  type User {
    id: ID!
    name: String!
    email: String!
    avatarUrl: String!
    confirmed: Boolean!
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
  type FileUploadResponse {
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
    user(id: ID!): User!
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
    setAvatar(id: ID!, avatar: Upload!): FileUploadResponse
  }
`;

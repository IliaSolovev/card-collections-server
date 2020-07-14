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
  type Query {
    getUser: User!
    login(login: String!, password: String!): LoginResponse!
  }
  type Mutation {
      registerUser(login: String!, password: String!): RegisterResponse!
  }
`
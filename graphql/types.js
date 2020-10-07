const { gql } = require("apollo-server");

const types = gql`
  type User {
    username: String!
    email: String!
    createdAt: String!
    token: String!
  }
  type Message {
    uuid: String!
    content: String!
    from: String!
    to: String!
    createdAt: String!
  }
  type Query {
    getUsers: [User]!
    login(username: String!, password: String!): User!
    getMessages(from: String!): [Message]!
  }
  type Mutation {
    sendMessage(to: String!, content: String!): Message!
    register(
      username: String!
      email: String!
      password: String!
      confirmPassword: String!
    ): User!
  }
`;
module.exports = types;

const { gql } = require("apollo-server");

const types = gql`
  type User {
    username: String!
    email: String!
  }
  type Query {
    getUsers: [User]!
  }
`;
module.exports = types;

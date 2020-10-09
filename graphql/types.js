const { gql } = require("apollo-server");

const types = gql`
  type User {
    username: String!
    email: String
    createdAt: String!
    token: String!
    imageUrl: String
    latestMessage: Message
  }
  type Message {
    uuid: String!
    content: String!
    from: String!
    to: String!
    createdAt: String!
  }
  type Reaction {
    uuid: String!
    content: String!
    createdAt: String!
    message: Message!
    user: User!
  }
  type Query {
    getUsers: [User]!
    login(username: String!, password: String!): User!
    getMessages(from: String!): [Message]!
  }
  type Mutation {
    sendMessage(to: String!, content: String!): Message!
    reactToMessage(uuid: String!, content: String!): Reaction!
    register(
      username: String!
      email: String!
      password: String!
      confirmPassword: String!
    ): User!
  }
  type Subscription {
    newMessage: Message!
    newReaction: Reaction!
  }
`;
module.exports = types;

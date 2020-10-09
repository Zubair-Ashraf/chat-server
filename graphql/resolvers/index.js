const userResolvers = require("./users");
const messageResolvers = require("./messages");
const { User, Message } = require("../../models");

module.exports = {
  Message: {
    createdAt: (parent) => {
      return parent.createdAt.toISOString();
    },
  },
  User: {
    createdAt: (parent) => {
      return parent.createdAt.toISOString();
    },
  },
  Reaction: {
    createdAt: (parent) => {
      return parent.createdAt.toISOString();
    },
    message: async (parent) => {
      return await Message.findByPk(parent.messageId);
    },
    user: async (parent) => {
      return await User.findByPk(parent.userId, {
        attributes: ["username", "imageUrl", "createdAt"],
      });
    },
  },
  Query: {
    ...userResolvers.Query,
    ...messageResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...messageResolvers.Mutation,
  },
  Subscription: {
    ...messageResolvers.Subscription,
  },
};

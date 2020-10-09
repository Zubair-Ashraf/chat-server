const { User, Message, Reaction } = require("../../models");
const {
  UserInputError,
  AuthenticationError,
  withFilter,
  ForbiddenError,
} = require("apollo-server");
const { Op } = require("sequelize");

const resolvers = {
  Query: {
    getMessages: async (parent, { from }, { user }) => {
      try {
        if (!user) throw new UserInputError("Unauthenticated");
        const otherUser = await User.findOne({
          where: { username: from },
        });
        if (!otherUser) throw new UserInputError("User not found");
        const usernames = [user.username, otherUser.username];
        const messages = await Message.findAll({
          where: {
            from: { [Op.in]: usernames },
            to: { [Op.in]: usernames },
          },
          order: [["createdAt", "DESC"]],
        });
        return messages;
      } catch (error) {
        throw error;
      }
    },
  },
  Mutation: {
    sendMessage: async (parent, { to, content }, { user, pubsub }) => {
      try {
        if (!user) throw new AuthenticationError("Unanthenticated");
        const recipient = await User.findOne({
          where: { username: to },
        });
        if (!recipient) throw new UserInputError("User not found");
        if (recipient && recipient.username === user.username)
          throw new UserInputError("you can't message yourself");
        if (content.trim() === "") throw new UserInputError("Message is empty");
        const message = await Message.create({
          from: user.username,
          to,
          content,
        });
        pubsub.publish("NEW_MESSAGE", { newMessage: message });
        return message;
      } catch (error) {
        throw new UserInputError(error);
      }
    },
    reactToMessage: async (_, { uuid, content }, { user, pubsub }) => {
      const reactions = ["❤️", "😆", "😯", "😢", "😡", "👍", "👎"];

      try {
        if (!reactions.includes(content)) {
          throw new UserInputError("Invalid reaction");
        }

        const username = user ? user.username : "";
        user = await User.findOne({ where: { username } });
        if (!user) throw new AuthenticationError("Unauthenticated");

        const message = await Message.findOne({ where: { uuid } });
        if (!message) throw new UserInputError("message not found");

        if (message.from !== user.username && message.to !== user.username) {
          throw new ForbiddenError("Unauthorized");
        }

        let reaction = await Reaction.findOne({
          where: { messageId: message.id, userId: user.id },
        });

        if (reaction) {
          reaction.content = content;
          await reaction.save();
        } else {
          reaction = await Reaction.create({
            messageId: message.id,
            userId: user.id,
            content,
          });
        }

        pubsub.publish("NEW_REACTION", { newReaction: reaction });

        return reaction;
      } catch (err) {
        throw err;
      }
    },
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (parent, args, { user, pubsub }) => {
          if (!user) throw new AuthenticationError("Unanthenticated");
          return pubsub.asyncIterator("NEW_MESSAGE");
        },
        ({ newMessage }, args, { pubsub, user }) => {
          if (
            newMessage.from === user.username ||
            newMessage.to === user.username
          ) {
            return true;
          } else {
            return false;
          }
        }
      ),
    },
    newReaction: {
      subscribe: withFilter(
        (parent, args, { user, pubsub }) => {
          if (!user) throw new AuthenticationError("Unanthenticated");
          return pubsub.asyncIterator("NEW_REACTION");
        },
        async ({ newReaction }, args, { pubsub, user }) => {
          const message = await newReaction.getMessage();
          if (message.from === user.username || message.to === user.username) {
            return true;
          } else {
            return false;
          }
        }
      ),
    },
  },
};

module.exports = resolvers;

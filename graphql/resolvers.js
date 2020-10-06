const { User } = require("../models");

const resolvers = {
  Query: {
    getUsers: () => {
      try {
        return User.findAll();
      } catch (error) {
        console.log(error);
      }
    },
  },
};

module.exports = resolvers;

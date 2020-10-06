const { User } = require("../models");
const bcrypt = require("bcryptjs");
const { UserInputError } = require("apollo-server");

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
  Mutation: {
    register: async (
      parent,
      { username, email, password, confirmPassword }
    ) => {
      let errors = {};
      try {
        if (username.trim() === "") errors.username = "Username is required";
        if (email.trim() === "") errors.email = "Email is required";
        if (password.trim() === "") errors.password = "Password is required";
        if (confirmPassword.trim() === "")
          errors.confirmPassword = "Confirm Password is required";
        if (password != confirmPassword)
          errors.confirmPassword = "Password must be match";
        // if (await User.findOne({ where: { username } }));
        // errors.username = "Username already exists";
        // if (await User.findOne({ where: { email } }));
        // errors.email = "Email already exists";

        if (Object.keys(errors).length > 0) throw errors;

        password = await bcrypt.hash(password, 6);
        const user = await User.create({
          username,
          email,
          password,
        });
        return user;
      } catch (err) {
        if (
          err.name === "SequelizeUniqueConstraintError" ||
          err.name === "SequelizeValidationError"
        ) {
          err.errors.forEach((e) => (errors[e.path] = e.message));
        }
        throw new UserInputError("Bad request", { errors });
      }
    },
  },
};

module.exports = resolvers;

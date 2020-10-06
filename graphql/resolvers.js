const { User } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env.json");
const { UserInputError, AuthenticationError } = require("apollo-server");

const resolvers = {
  Query: {
    getUsers: (parent, args, { req }) => {
      let user;
      try {
        if (req.headers && req.headers.authorization) {
          let token = req.headers.authorization.split("Bearer ")[1];
          jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
            if (err) throw new AuthenticationError("Unanthenticated");
            user = decodedToken;
          });
        }
        return User.findAll({
          where: { username: { [Op.ne]: user.username } },
        });
      } catch (error) {
        throw error;
      }
    },
    login: async (parent, { username, password }) => {
      let errors = {};
      const user = await User.findOne({
        where: { username },
      });
      if (!user) {
        errors.username = "User not found";
        throw new UserInputError("User not found", { errors });
      }
      let isPasswordMatched = await bcrypt.compare(password, user.password);
      if (!isPasswordMatched) {
        errors.password = "Invalid password";
        throw new UserInputError("Invalid password", { errors });
      }

      let token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "7 days" }
      );
      return {
        ...user.toJSON(),
        createdAt: user.createdAt.toISOString(),
        token,
      };
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

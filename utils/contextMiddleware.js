const { AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env.json");

module.exports = (context) => {
  if (context.req.headers && context.req.headers.authorization) {
    let token = context.req.headers.authorization.split("Bearer ")[1];
    jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
      //   if (err) throw
      context.user = decodedToken;
    });
  }
  return context;
};
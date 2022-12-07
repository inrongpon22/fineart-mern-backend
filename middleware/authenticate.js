// authenticae is the middle ware here

const Users = require("../models/userSchema");
const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
  try {
    // get the cookies
    const token = req.cookies.jwt;
    if (!token) {
      res.status(401).send("No token");
    } else {
      const veriftToken = jwt.verify(token, process.env.SECRET_KEY);
      const rootUser = await Users.findOne({
        _id: veriftToken._id,
        "tokens.token": token,
      });

      if (!rootUser) {
        res.status(401).send("User not found");
      } else {
        res.status(200).send("Authorized user");
      }
    }

    next();
  } catch (error) {
    res.status(401).send("Error");
    console.log(error);
  }
};

module.exports = authenticate;

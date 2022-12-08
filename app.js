//import all dependencies
const dotenv = require("dotenv");
const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();

// Configure ENV File & Require Connection File
dotenv.config({ path: "./config.env" });
require("./db/conn.js");
const port = process.env.PORT;

// Require Model
const Users = require("./models/userSchema.js");
const Message = require("./models/msgSchema.js");
const authenticate = require("./middleware/authenticate");

// These method is used to get data and cookies from front end
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/api", (req, res) => {
  res.send("Hello World");
});

// Registeration
app.post("/api/register", async (req, res) => {
  try {
    // GET body or Data
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const createUser = new Users({
      username: username,
      email: email,
      password: password,
    });

    // Save mothod is used to create user or insert user
    const created = await createUser.save();
    console.log(created);
    res.status(200).send("Registed");
  } catch (err) {
    res.status(400).send(err);
  }
});

// Login user
app.post("/api/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    // find user if exist
    const user = await Users.findOne({ email: email });
    if (user) {
      // verify password
      const isMatch = await bcryptjs.compare(password, user.password);
      if (isMatch) {
        // Generated token which define in user schema
        const token = await user.generateToken();
        res.cookie("jwt", token, {
          // expires token in
          expires: new Date(Date.now() + 86400000),
          httpOnly: true,
        });
        res.status(200).send("LoggedIn");
      } else {
        res.status(400).send("Invalid Credentials");
      }
    } else {
      res.status(400).send("Invalid Credentials");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// Message
app.post("/api/message", async (req, res) => {
  try {
    // GET body or Data
    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;

    const sendMsg = new Message({
      name: name,
      email: email,
      message: message,
    });

    // Save mothod is used to create user or insert user
    const created = await sendMsg.save();
    console.log(created);
    res.status(200).send("Sent");
  } catch (err) {
    res.status(400).send(err);
  }
});

// Logout page
app.get("/api/logout", (req, res) => {
  res.clearCookie("jwt", { path: "/" });
  res.status(200).send("User logged out");
});

// Authentication
app.get("/api/auth", authenticate, (req, res) => {});

//Run Server
app.listen(port, () => {
  console.log("Server is Listening");
});

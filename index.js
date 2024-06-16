const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv").config();
const cors = require("cors");
const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

//connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("connected to database");
  })

  .catch((err) => {
    console.log(err);
  });

//schema

const userSchema = mongoose.Schema(
  {
    name: String,
    password: String,
    email: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("names", userSchema);

//signup api

app.post("/signup",async (req, res, next) => {
  try {
    const { name, password, email } = req.body;
    const exisitingUser = await userModel.findOne({ email: email });

    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);

    if (!exisitingUser) {
      const user = new userModel({
        name: name,
        email: email,
        password: hashpassword,
      });

      await user.save();
      res.status(200).send("User created successfully");
    }
    return res.status(401).send("Error while registering" + error);
  } catch (error) {
    return res.send("Error while registering" + error);
  }
});

//login api
app.post("/login",  async (req, res,) => {
  try {
    const { name, password, email } = req.body;
    const exisitingUser =  await userModel.findOne({ email: email });
    if (!exisitingUser) {
      return res.status(404).send("User does not exist");
    }
      const isPasswordCorrect = await bcrypt.compare(
        password,
        exisitingUser.password
      );
    

    if (isPasswordCorrect) {
      return res.status(200).send("User Logged in successfully");
    }
    return res.status(401).send("Email and password does not match");
  } catch (error) {
    return res.status(401).send("Error while logging in" + error);
  }
});

app.get("/", (req, res, next) => {
  return res.send("Connected with the server!!");
});

app.listen(PORT,  (req, res) => {
  console.log("Hello, I am your server!! at " +PORT);
});

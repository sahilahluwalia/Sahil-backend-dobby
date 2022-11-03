const express = require("express");
const router = express.Router();
const userModel = require("../models/userModels");
const imageModel = require("../models/imageModel");
const jsonwebtoken = require("jsonwebtoken");
const KEY = process.env.SECRET_KEY;
module.exports = router;

const { data } = require("../controllers/dataController");

let refreshTokens = [];

const imageuploader = async (req, res) => {
  const { link, name, id } = req.body;
  // return res.status(200).json(req.body);
  console.log(req.body);
  try {
    const result = await imageModel.create({
      id: id,
      name: name,
      link: link,
    });
    return res.status(201).json({ result: result });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "not uploaded" });
  }
};
const signup = async (req, res) => {
  console.log("signup");

  const { email, password } = req.body;
  try {
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      return res.status(403).json("Already Exist");
    }
    const result = await userModel.create({
      email: email,
      password: password,
    });
    const token = jsonwebtoken.sign({ email: result.email }, KEY);
    return res.status(201).json({ user: result, token: token, id: result._id });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const imagegetter = async (req, res) => {
  const { id } = req.body;
  try {
    const records = await imageModel.find({ id: id });
    if (!records) {
      return res.status(404).json("Images not found");
    }
    return res.status(200).json({
      result: records,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json("catch block in imagegetter");
  }
};
const signin = async (req, res) => {
  const { email, password } = req.body;
  console.log("signin");
  console.log(req.body);

  try {
    const existingUser = await userModel.findOne({ email: email });
    if (!existingUser) {
      return res.status(404).json("User not found");
    }
    if (existingUser.password !== password) {
      return res.status(400).json({ message: "invalid password" });
    }
    const token = generateAccessToken(existingUser);
    const refreshToken = jsonwebtoken.sign({ email: existingUser.email }, KEY);
    // return res.status(404).json("User not found");
    refreshTokens.push(refreshToken);
    console.log(existingUser);
    return res.status(200).json({
      email: existingUser.email,
      token: token,
      refreshToken: refreshToken,
      id: existingUser._id,
      user: existingUser,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json("Catch Error");
  }
};

const token = (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jsonwebtoken.verify(refreshToken, KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    const token = generateAccessToken({ email: user.email });
    res.status(200).json({ token: token });
  });
};

function generateAccessToken(existingUser) {
  return jsonwebtoken.sign({ email: existingUser.email }, KEY, {
    expiresIn: "1000m",
  });
}
const signout = (req, res) => {
  console.log("req.body.token");
  console.log(req.body.token);
  const mytoken = req.body.token;
  console.log(`before :` + refreshTokens);
  console.log(mytoken);
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);

  console.log(`after :` + refreshTokens);
  return res.status(200).json({
    refreshTokens: refreshTokens,
    giventoken: mytoken,
  });
};

router.post("/auth/signup", signup);

router.post("/auth/signin", signin);
router.post("/token", token);

router.get("/getdata", authToken, data);

router.delete("/auth/signout", signout);

router.post("/images", imageuploader);

router.post("/getimages", imagegetter);

function authToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.sendStatus(401);
  }
  jsonwebtoken.verify(token, KEY, (err, user) => {
    if (err) return res.status(403).json("token expried");
    req.user = user;
    next();
  });
}

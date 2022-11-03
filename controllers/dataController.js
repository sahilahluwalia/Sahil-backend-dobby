const dataModel = require("../models/dataModels");
const userModel = require("../models/userModels");
const data = async (req, res) => {
  console.log("data");
  //   return res.status(200).json("result");

  const result = await dataModel.find();
  return res.status(200).json(result);
};

module.exports = { data };

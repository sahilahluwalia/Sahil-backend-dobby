const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
  name: {
    required: true,
    type: String,
  },
  link: {
    required: true,
    type: String,
  },
});

module.exports = mongoose.model("Image", imageSchema);

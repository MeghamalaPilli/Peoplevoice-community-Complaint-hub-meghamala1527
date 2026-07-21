const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  value: {
    type: String,
    unique: true,
    required: true
  },
  label: String,
  description: String,
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  }
});

module.exports = mongoose.model("Category", categorySchema);
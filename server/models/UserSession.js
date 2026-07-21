const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    token: {
      type: String,
      required: true,
    },

    browser: {
      type: String,
      default: "",
    },

    os: {
      type: String,
      default: "",
    },

    device: {
      type: String,
      default: "",
    },

    ip: {
      type: String,
      default: "",
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserSession", userSessionSchema);
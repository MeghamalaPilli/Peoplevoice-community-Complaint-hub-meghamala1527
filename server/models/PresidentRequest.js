const mongoose = require("mongoose");

const presidentRequestSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: String,
    aadharNumber: String,
    villageName: String,
    mandal: String,
    address: String,
    pincode: String,

    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("PresidentRequest", presidentRequestSchema);
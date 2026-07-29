const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});

const mongoose = require("mongoose");
const User = require("../models/User");

async function SuperAdmin() {
    try {

        await mongoose.connect(
            process.env.MONGO_URI || process.env.MONGODB_URI
        );

        const existing = await User.findOne({
            role: "superadmin"
        });

        if (existing) {
            console.log("✅ Super Admin already exists");
            process.exit();
        }

        const admin = new User({
            name: "System Administrator",
            email: "superadmin@gpms.com",
            password: "Admin@123",
            phone: "9876543210",
            role: "superadmin",
            villageName: "",
            mandal: "",
            wardNumber: "",
            address: ""
        });

        await admin.save();

        console.log("✅ Super Admin Created Successfully");

        process.exit();

    } catch (err) {
        console.log(err);
        process.exit();
    }
}

SuperAdmin();
const express = require("express");
const router = express.Router();

const Village = require("../models/Village");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const superAdminOnly = (req, res, next) => {

    if (req.user.role !== "superadmin") {

        return res.status(403).json({
            success: false,
            message: "Only Super Admin can perform this action"
        });

    }

    next();

};

router.post(
    "/create-user",
    protect,
    superAdminOnly,
    async (req, res) => {

        try {

            const {
                name,
                email,
                password,
                phone,
                role,
                villageName,
                mandal,
                wardNumber,
                address,
                pincode
            } = req.body;

            if (!["admin", "president"].includes(role)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid role"
                });

            }

            const exists = await User.findOne({ email });

            if (exists) {

                return res.status(400).json({
                    success: false,
                    message: "Email already exists"
                });

            }

            const user = await User.create({

                name,
                email,
                password,
                phone,
                role,

                villageName,
                mandal,
                wardNumber,
                address,
                pincode

            });

            res.status(201).json({

                success: true,
                message: `${role} created successfully`,
                user

            });

        } catch (err) {

            res.status(500).json({

                success: false,
                message: err.message

            });

        }

    }
);
// Add village
router.post("/villages", protect, superAdminOnly, async (req, res) => {
  try {
    const { name, mandal, district, pincode } = req.body;

    const exists = await Village.findOne({
      name,
      mandal
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Village already exists"
      });
    }

    const village = await Village.create({
      name,
      mandal,
      district,
      pincode
    });

    res.status(201).json({
      success: true,
      village
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.get("/villages", protect, superAdminOnly, async (req, res) => {

    // 1. Find all Admins
const admins = await User.find({ role: "admin" });

for (const admin of admins) {

    console.log({
        name: admin.name,
        village: admin.villageName,
        mandal: admin.mandal,
        pincode: admin.pincode
    });

    if (!admin.villageName) continue;

    const exists = await Village.findOne({
        name: admin.villageName
    });

    if (!exists) {

        console.log("Creating village:", admin.villageName);

        await Village.create({
            name: admin.villageName,
            mandal: admin.mandal || "",
            district: admin.district || "Unknown",
            pincode: admin.pincode,
            isActive: true
        });

    }
}
// 3. Return villages
const villages = await Village.find().sort("name");

res.json({
    success: true,
    villages
});

});

router.put("/villages/:id", protect, superAdminOnly, async (req, res) => {

    const village = await Village.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json({
        success: true,
        village
    });

});

router.delete("/villages/:id", protect, superAdminOnly, async (req, res) => {

    await Village.findByIdAndDelete(req.params.id);

    res.json({
        success: true,
        message: "Village deleted"
    });

});

router.post(
    "/admins/:id/login",
    protect,
    superAdminOnly,
    async (req, res) => {

        const jwt = require("jsonwebtoken");

        const admin = await User.findById(req.params.id);

        if (!admin || admin.role !== "admin") {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE || "7d"
            }
        );

        res.json({
            success: true,
            token,
            admin
        });

    }
);
module.exports = router;
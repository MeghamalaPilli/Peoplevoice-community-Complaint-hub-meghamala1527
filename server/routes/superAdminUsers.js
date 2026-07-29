const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Village = require("../models/Village");

const { protect } = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");
const UserSession = require("../models/UserSession");
const UAParser = require("ua-parser-js");
const crypto = require("crypto");


const superAdminOnly = (req, res, next) => {

    if (req.user.role !== "superadmin") {
        return res.status(403).json({
            success: false,
            message: "Only Super Admin can perform this action"
        });
    }

    next();
};

const jwt = require("jsonwebtoken");

router.post(
    "/admins/:id/impersonate",
    protect,
    superAdminOnly,
    async (req, res) => {

        try {

            const admin = await User.findById(req.params.id);

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: "Admin not found"
                });
            }

            if (admin.role !== "admin") {
                return res.status(400).json({
                    success: false,
                    message: "Selected user is not an admin"
                });
            }

            const token = jwt.sign(
                {
                    id: admin._id,
                    impersonation: true,
                    impersonatedBy: req.user._id
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRE || "7d"
                }
            );

            const parser = new UAParser(req.headers["user-agent"]);
            const result = parser.getResult();

            let ip =
                req.headers["x-forwarded-for"] ||
                req.socket.remoteAddress ||
                "";

            if (ip.startsWith("::ffff:")) {
                ip = ip.replace("::ffff:", "");
            }

            await UserSession.create({

                user: admin._id,

                token,

                browser: result.browser.name || "Unknown Browser",

                os: result.os.name || "Unknown OS",

                device: result.device.type || "Desktop",

                ip,

                lastActive: new Date()

            });
            await UserSession.create({

    user: admin._id,

    token,

    browser: "Impersonation",

    os: "Super Admin",

    device: "Super Admin",

    ip: req.ip,

    lastActive: new Date()

});

            res.json({

                success: true,

                token,

                admin

            });

        } catch (err) {

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }
);

router.post(
    "/stop-impersonation",
    protect,
    async (req, res) => {

        try {

            const token =
                req.headers.authorization.split(" ")[1];

            await UserSession.deleteOne({
                token
            });

            res.json({
                success: true,
                message: "Returned to Super Admin"
            });

        }

        catch (err) {

            res.status(500).json({
                success: false,
                message: err.message
            });

        }

    }
);
router.post(
    "/admins",
    protect,
    superAdminOnly,
    async (req, res) => {

        try {

           const {
    name,
    email,
    phone,
    villageId,
    wardNumber
} = req.body;

const password =
    crypto.randomBytes(5).toString("hex");

            const exists = await User.findOne({ email });

            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists"
                });
            }

            const village = await Village.findById(villageId);

            if (!village) {
                return res.status(404).json({
                    success: false,
                    message: "Village not found"
                });
            }

            const admin = await User.create({

                name,
                email,
                password,
                phone,

                role: "admin",

                villageName: village.name,
                mandal: village.mandal,
                address: "",
                wardNumber,
                pincode: village.pincode

            });

           await sendEmail(

    email,

    "Welcome to CivicPulse - Village Admin Account",

    `
Hello ${name},

Your Village Admin account has been created successfully.

-----------------------------------

Village
${village.name}

Email
${email}

Temporary Password
${password}

-----------------------------------

Please login using the above credentials.

For security reasons, please change your password immediately after your first login.

Regards,

CivicPulse Team

`

);

            res.status(201).json({

                success: true,
                message: "Village Admin created successfully",

                admin

            });

        }

        catch (err) {

            res.status(500).json({

                success: false,
                message: err.message

            });

        }

    }
);

router.get(
    "/admins",
    protect,
    superAdminOnly,
    async (req, res) => {

        try {

            const admins = await User.find({
                role: "admin"
            }).sort({
                createdAt: -1
            });

            res.json({
                success: true,
                admins
            });

        } catch (err) {

            res.status(500).json({
                success: false,
                message: err.message
            });

        }

    }
);

router.put(
    "/admins/:id",
    protect,
    superAdminOnly,
    async (req, res) => {

        try {

            const admin = await User.findById(req.params.id);

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: "Admin not found"
                });
            }

            admin.name = req.body.name;
            admin.email =req.body.email;
            admin.phone = req.body.phone;

            await admin.save();

            res.json({
                success: true,
                message: "Admin updated successfully",
                admin
            });

        } catch (err) {

            res.status(500).json({
                success: false,
                message: err.message
            });

        }

    }
);

router.patch(
    "/admins/:id/status",
    protect,
    superAdminOnly,
    async (req, res) => {

        try {

            const admin = await User.findById(req.params.id);

            if (!admin) {

                return res.status(404).json({
                    success: false,
                    message: "Admin not found"
                });

            }

            admin.isActive = !admin.isActive;

            await admin.save();

            res.json({

                success: true,
                message: admin.isActive
                    ? "Admin Enabled"
                    : "Admin Disabled",

                admin

            });

        }

        catch(err){

            res.status(500).json({
                success:false,
                message:err.message
            });

        }

    }
);
router.delete(
    "/admins/:id",
    protect,
    superAdminOnly,
    async (req, res) => {

        try {

            const admin = await User.findById(req.params.id);

            if (!admin) {

                return res.status(404).json({
                    success: false,
                    message: "Admin not found"
                });

            }

            await User.findByIdAndDelete(req.params.id);

            res.json({
                success: true,
                message: "Village Admin deleted successfully"
            });

        } catch (err) {

            res.status(500).json({
                success: false,
                message: err.message
            });

        }

    }
);
module.exports = router;
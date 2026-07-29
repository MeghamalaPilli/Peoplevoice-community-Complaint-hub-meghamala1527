const express = require("express");
const router = express.Router();

const Village = require("../models/Village");
const { protect } = require("../middleware/auth");

// Super Admin Middleware
const superAdminOnly = (req, res, next) => {

    if (req.user.role !== "superadmin") {
        return res.status(403).json({
            success: false,
            message: "Only Super Admin can access"
        });
    }

    next();

};

//
// CREATE VILLAGE
//

// Public route for registration

router.get("/public", async (req, res) => {

    try {

        const villages = await Village.find().sort("name");

        res.json({
            success: true,
            villages
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});
router.post(
    "/",
    protect,
    superAdminOnly,
    async (req, res) => {

        try {

            const village = await Village.create(req.body);

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

    }
);

//
// GET ALL VILLAGES
//

router.get("/", async (req, res) => {

    try {

        const villages = await Village
            .find()
            .sort({ name: 1 });

        res.json({
            success: true,
            villages
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

//
// UPDATE VILLAGE
//

router.put(
    "/:id",
    protect,
    superAdminOnly,
    async (req, res) => {

        const village = await Village.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json({
            success: true,
            village
        });

    }
);

//
// DELETE VILLAGE
//

router.delete(
    "/:id",
    protect,
    superAdminOnly,
    async (req, res) => {

        await Village.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Village deleted"
        });

    }
);

module.exports = router;
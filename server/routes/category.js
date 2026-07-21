const express = require("express");
const router = express.Router();

const Category = require("../models/Category");
const { protect, authorize } = require("../middleware/auth");
router.post(
  "/",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { name, description } = req.body;

      // Check required field
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Category name is required"
        });
      }

      // Check duplicate category
      const existing = await Category.findOne({ name });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Category already exists"
        });
      }

      // Create category
      const category = await Category.create({
        name,
        description
      });

      res.status(201).json({
        success: true,
        message: "Category created successfully",
        category
      });

      // Get Active Categories (Citizen)
router.get("/", async (req, res) => {
  try {

    const categories = await Category.find({
      status: "Active"
    }).sort({ name: 1 });

    res.json({
      success: true,
      categories
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
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
const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const PresidentRequest = require('../models/PresidentRequest');
const { protect } = require('../middleware/auth');
const logger = require('../config/logger');
const sendEmail = require('../utils/sendEmail');
const uploadProfile = require("../middleware/uploadProfile");
const UserSession = require("../models/UserSession");
const UAParser = require("ua-parser-js");

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
const sendTokenResponse = (
  user,
  statusCode,
  res,
  message,
  token = signToken(user._id)
) => {
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      department: user.department,
      villageName: user.villageName,
      mandal: user.mandal,
      wardNumber: user.wardNumber,
      pincode: user.pincode,
      address: user.address,
      profilePicture: user.profilePicture,
      residenceHistory: user.residenceHistory,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      unreadNotifications: user.getUnreadCount
        ? user.getUnreadCount()
        : 0,
    },
  });
};

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name required').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    const {
name,
email,
password,
phone,
role,
wardNumber,
villageName='',
mandal='',
address='',
pincode = '',
aadharNumber=''
} = req.body;
    const normalizedRole = ['citizen', 'president', 'admin'].includes(role) ? role : 'citizen';

    if (await User.findOne({ email })) return res.status(400).json({ success: false, message: 'Email already registered' });
if (await PresidentRequest.findOne({ email })) {
  return res.status(400).json({
    success: false,
    message: "President request already submitted."
  });
}
   // If President → create a request only
if (normalizedRole === "president") {

    await PresidentRequest.create({
        name,
        email,
        password,
        phone,
        villageName,
        mandal,
        address,
        pincode,
        PresidentRequest,
        aadharNumber
    });

    return res.status(201).json({
        success: true,
        message: "President request submitted. Wait for admin approval."
    });
}

// Otherwise create a normal citizen account
const user = await User.create({
    name,
    email,
    password,
    phone,
    role: "citizen",
    wardNumber,
    villageName,
    mandal,
    address,
    pincode
});

logger.info(`New user: ${email} [${user.role}]`);


sendTokenResponse(user, 201, res, "Registration successful");
  } catch (err) { next(err); }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      logger.warn(`Failed login: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated' });
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    logger.info(`Login: ${email} [${user.role}]`);
    const token = signToken(user._id);

const parser = new UAParser(req.headers["user-agent"]);
const result = parser.getResult();

let ip =
  req.headers["x-forwarded-for"] ||
  req.socket.remoteAddress ||
  "";

if (ip === "::1") {
  ip = "127.0.0.1";
}

if (ip.startsWith("::ffff:")) {
  ip = ip.replace("::ffff:", "");
}

await UserSession.create({
  user: user._id,
  token,
  browser: result.browser.name || "Unknown Browser",
  os: result.os.name || "Unknown OS",
  device:
    result.device.type ||
    result.device.model ||
    "Desktop",
  ip,
  lastActive: new Date(),
});
    
    sendTokenResponse(
  user,
  200,
  res,
  "Login successful",
  token
);
  } catch (err) { next(err); }
});

router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user: { id: user._id, name: user.name,villageName: user.villageName, wardNumber: user.wardNumber, email: user.email, role: user.role, phone: user.phone, address: user.address,mandal: user.mandal, pincode: user.pincode, department: user.department, createdAt: user.createdAt, lastLogin: user.lastLogin, profilePicture: user.profilePicture, residenceHistory: user.residenceHistory, unreadNotifications: user.getUnreadCount(), notifications: user.notifications.slice(-20).reverse() } });
  } catch (err) { next(err); }
});

router.put('/profile', protect, async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    const oldVillage = user.villageName;
    const oldMandal = user.mandal;
    const oldWard = user.wardNumber;
    const oldAddress = user.address;

    user.name = req.body.name;
    user.phone = req.body.phone;
    user.address = req.body.address;
    user.pincode = req.body.pincode;

    // Residence Changed

    if (
      oldVillage !== req.body.villageName ||
      oldMandal !== req.body.mandal ||
      oldWard !== req.body.wardNumber ||
      oldAddress !== req.body.address
    ) {

      user.residenceHistory.push({
        villageName: oldVillage,
        mandal: oldMandal,
        wardNumber: oldWard,
        address: oldAddress
      });

      user.villageName = req.body.villageName;
      user.mandal = req.body.mandal;
      user.wardNumber = req.body.wardNumber;
      user.address = req.body.address;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated",
      user
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.put("/change-password/verify", protect, async (req, res) => {
  try {

    const { currentPassword, newPassword, otp } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.post(
  "/profile-picture",
  protect,
  uploadProfile.single("profilePicture"),
  async (req, res) => {
    try {

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload an image"
        });
      }

      const imagePath = `/profileUploads/${req.file.filename}`;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          profilePicture: imagePath
        },
        {
          new: true
        }
      );

      res.json({
        success: true,
        message: "Profile picture updated",
        profilePicture: user.profilePicture
      });

    } catch (err) {

      res.status(500).json({
        success: false,
        message: err.message
      });

    }
  }
);
router.delete(
  "/profile-picture",
  protect,
  async (req, res) => {

    try {

      const fs = require("fs");
      const path = require("path");

      const user = await User.findById(req.user._id);

      if (user.profilePicture) {

        const filePath = path.join(
          __dirname,
          "..",
          user.profilePicture
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        user.profilePicture = "";

        await user.save();
      }

      res.json({
        success: true,
        message: "Profile picture removed"
      });

    } catch (err) {

      res.status(500).json({
        success: false,
        message: err.message
      });

    }

  }
);

router.get('/notifications', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json({ success: true, notifications: user.notifications.reverse() });
  } catch (err) { next(err); }
});

router.put('/notifications/read', protect, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { 'notifications.$[].read': true } });
    res.json({ success: true, message: 'All marked read' });
  } catch (err) { next(err); }
});

router.post('/request-reset-otp', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    await user.save({ validateBeforeSave: false });

    await sendEmail(
      email,
      'Password Reset OTP',
      `Your OTP for resetting your password is: ${otp}\n\nThis OTP is valid for 5 minutes.`
    );

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });

  } catch (err) {
  console.error("REQUEST RESET OTP ERROR:");
  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message
  });
}
});

router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new OTP.'
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
router.post('/request-change-password-otp', protect, async (req, res) => {
  try {
    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is required'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    await sendEmail(
      user.email,
      'Password Change OTP',
      `Your OTP for changing your password is: ${otp}\n\nThis OTP is valid for 5 minutes.`
    );

    res.json({
      success: true,
      message: 'OTP sent to your registered email.'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
router.get("/sessions", protect, async (req, res) => {
  try {

    const sessions = await UserSession.find({
      user: req.user._id
    }).sort({ lastActive: -1 });

    res.json({
      success: true,
      sessions
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.delete("/sessions/logout-others", protect, async (req, res) => {
  try {

    const token = req.headers.authorization.split(" ")[1];

    await UserSession.deleteMany({
      user: req.user._id,
      token: { $ne: token }
    });

    res.json({
      success: true,
      message: "Logged out from all other devices"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.delete(
  "/sessions/:id",
  protect,
  async (req, res) => {

    try {

      await UserSession.deleteOne({
        _id: req.params.id,
        user: req.user._id
      });

      res.json({
        success: true,
        message: "Device removed"
      });

    } catch (err) {

      res.status(500).json({
        success: false,
        message: err.message
      });

    }

  }
);

router.get("/active-devices", protect, async (req, res) => {
  try {

    // Get JWT from Authorization header
    const currentToken = req.headers.authorization?.split(" ")[1];

    const sessions = await UserSession.find({
      user: req.user._id
    }).sort({ lastActive: -1 });

    const devices = sessions.map(session => ({
      _id: session._id,
      browser: session.browser,
      os: session.os,
      device: session.device,
      ip: session.ip,
      lastActive: session.lastActive,

      // This tells frontend which device is the current one
      isCurrent: session.token === currentToken
    }));

    res.json({
      success: true,
      sessions: devices
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.delete("/logout-other-devices", protect, async (req, res) => {
  try {

    const token = req.headers.authorization.split(" ")[1];

    await UserSession.deleteMany({
      user: req.user._id,
      token: { $ne: token }
    });

    res.json({
      success: true,
      message: "Logged out from all other devices."
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.put('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    if (!newPassword || newPassword.length < 6) {
  return res.status(400).json({
    success: false,
    message: "Password must be at least 6 characters"
  });
}

    user.password = newPassword;

    // User model pre-save hook will hash the password automatically
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
router.get("/privacy", protect, async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      privacy: user.privacy
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
});

router.put("/privacy", protect, async (req, res) => {
  try {

    const {
      showEmail,
      showPhone,
      profileVisibility
    } = req.body;

    const user = await User.findById(req.user._id);

    user.privacy.showEmail = showEmail;
    user.privacy.showPhone = showPhone;
    user.privacy.profileVisibility = profileVisibility;

    await user.save();

    res.json({
      success: true,
      message: "Privacy settings updated successfully",
      privacy: user.privacy
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
});

module.exports = router;

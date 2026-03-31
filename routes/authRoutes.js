const express = require("express");
const router = express.Router();
const { registerUser, loginUser, refreshToken, logoutUser, forgotPassword, resetPassword } = require("../controllers/authController");
const { validateRegister, validateLogin } = require("../middleware/validate");

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;

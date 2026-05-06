const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// POST /api/auth/register → Inscription
router.post("/register", register);

// POST /api/auth/login → Connexion
router.post("/login", login);

// GET /api/auth/profile → Profil (protégé)
router.get("/profile", protect, getProfile);

module.exports = router;

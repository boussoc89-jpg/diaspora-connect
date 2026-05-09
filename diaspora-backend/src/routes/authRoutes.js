const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");
const { User } = require("../models/index");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);

// Lister tous les utilisateurs (admin uniquement)
router.get("/users", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password_hash"] },
      order: [["created_at", "DESC"]],
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

// Mettre à jour un utilisateur (admin uniquement)
router.put("/users/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    await user.update(req.body);
    res.json({ message: "Utilisateur mis à jour !", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

module.exports = router;

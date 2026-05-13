const express = require("express");
const router = express.Router();
const {
  getDepenses,
  createDepense,
  updateDepense,
  deleteDepense,
  getStatsDepenses,
} = require("../controllers/depenseController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

// GET /api/depenses → Lister toutes les dépenses
router.get("/", getDepenses);

// GET /api/depenses/stats → Statistiques
router.get("/stats", getStatsDepenses);

// POST /api/depenses → Créer une dépense
router.post("/", authorize("admin", "membre"), createDepense);

// PUT /api/depenses/:id → Modifier
router.put("/:id", authorize("admin", "membre"), updateDepense);

// DELETE /api/depenses/:id → Supprimer
router.delete("/:id", authorize("admin"), deleteDepense);

module.exports = router;

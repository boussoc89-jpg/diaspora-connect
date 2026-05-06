const express = require("express");
const router = express.Router();
const {
  getFinancements,
  createFinancement,
  updateFinancement,
  deleteFinancement,
  getStatsFinancement,
} = require("../controllers/financementController");
const { protect, authorize } = require("../middleware/auth");

// Toutes les routes nécessitent une authentification
router.use(protect);

// GET /api/financements/projet/:projet_id → Lister les financements d'un projet
router.get("/projet/:projet_id", getFinancements);

// GET /api/financements/stats/:projet_id → Statistiques financières
router.get("/stats/:projet_id", getStatsFinancement);

// POST /api/financements → Créer un financement
router.post("/", authorize("admin", "membre"), createFinancement);

// PUT /api/financements/:id → Modifier un financement
router.put("/:id", authorize("admin", "membre"), updateFinancement);

// DELETE /api/financements/:id → Supprimer un financement
router.delete("/:id", authorize("admin"), deleteFinancement);

module.exports = router;

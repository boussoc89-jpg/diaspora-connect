const express = require("express");
const router = express.Router();
const {
  getPartenaires,
  getPartenaire,
  createPartenaire,
  updatePartenaire,
  deletePartenaire,
} = require("../controllers/partenaireController");
const { protect, authorize } = require("../middleware/auth");

// Toutes les routes nécessitent une authentification
router.use(protect);

// GET /api/partenaires → Lister tous les partenaires
router.get("/", getPartenaires);

// GET /api/partenaires/:id → Voir un partenaire
router.get("/:id", getPartenaire);

// POST /api/partenaires → Créer un partenaire (admin + membre)
router.post("/", authorize("admin", "membre"), createPartenaire);

// PUT /api/partenaires/:id → Modifier un partenaire (admin + membre)
router.put("/:id", authorize("admin", "membre"), updatePartenaire);

// DELETE /api/partenaires/:id → Supprimer un partenaire (admin uniquement)
router.delete("/:id", authorize("admin"), deletePartenaire);

module.exports = router;

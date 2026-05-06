const express = require("express");
const router = express.Router();
const {
  getProjets,
  getProjet,
  createProjet,
  updateProjet,
  deleteProjet,
} = require("../controllers/projetController");
const { protect, authorize } = require("../middleware/auth");

// Toutes les routes nécessitent une authentification
router.use(protect);

// GET /api/projets → Lister tous les projets
router.get("/", getProjets);

// GET /api/projets/:id → Voir un projet
router.get("/:id", getProjet);

// POST /api/projets → Créer un projet (admin + membre)
router.post("/", authorize("admin", "membre"), createProjet);

// PUT /api/projets/:id → Modifier un projet (admin + membre)
router.put("/:id", authorize("admin", "membre"), updateProjet);

// DELETE /api/projets/:id → Supprimer un projet (admin uniquement)
router.delete("/:id", authorize("admin"), deleteProjet);

module.exports = router;

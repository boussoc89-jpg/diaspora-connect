const express = require("express");
const router = express.Router();
const {
  getCotisations,
  getCotisationsByMembre,
  createCotisation,
  updateCotisation,
  deleteCotisation,
  getStatsCotisations,
} = require("../controllers/cotisationController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

// GET /api/cotisations → Lister toutes les cotisations
router.get("/", getCotisations);

// GET /api/cotisations/stats → Statistiques
router.get("/stats", getStatsCotisations);

// GET /api/cotisations/membre/:user_id → Cotisations d'un membre
router.get("/membre/:user_id", getCotisationsByMembre);

// POST /api/cotisations → Créer une cotisation
router.post("/", authorize("admin", "membre"), createCotisation);

// PUT /api/cotisations/:id → Modifier
router.put("/:id", authorize("admin", "membre"), updateCotisation);

// DELETE /api/cotisations/:id → Supprimer
router.delete("/:id", authorize("admin"), deleteCotisation);

module.exports = router;

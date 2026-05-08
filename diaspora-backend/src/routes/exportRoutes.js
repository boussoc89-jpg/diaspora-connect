const express = require("express");
const router = express.Router();
const {
  exportProjetPDF,
  exportProjetsExcel,
} = require("../controllers/exportController");
const { protect } = require("../middleware/auth");

// Toutes les routes nécessitent une authentification
router.use(protect);

// GET /api/export/projet/:id/pdf → Export PDF d'un projet
router.get("/projet/:id/pdf", exportProjetPDF);

// GET /api/export/projets/excel → Export Excel de tous les projets
router.get("/projets/excel", exportProjetsExcel);

module.exports = router;

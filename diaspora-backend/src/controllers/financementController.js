const { Financement, Projet, Partenaire } = require("../models/index");

// Lister tous les financements d'un projet
const getFinancements = async (req, res) => {
  try {
    const financements = await Financement.findAll({
      where: { projet_id: req.params.projet_id },
      include: [
        { model: Partenaire, as: "partenaire", attributes: ["denomination"] },
      ],
    });
    res.json({ financements });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Créer un financement
const createFinancement = async (req, res) => {
  try {
    const {
      projet_id,
      partenaire_id,
      montant_promis,
      montant_verse,
      date_engagement,
      date_versement,
      reference,
      statut,
      notes,
    } = req.body;

    // Vérifier que le projet existe
    const projet = await Projet.findByPk(projet_id);
    if (!projet) {
      return res.status(404).json({ message: "Projet non trouvé." });
    }

    // Vérifier que le partenaire existe
    const partenaire = await Partenaire.findByPk(partenaire_id);
    if (!partenaire) {
      return res.status(404).json({ message: "Partenaire non trouvé." });
    }

    const financement = await Financement.create({
      projet_id,
      partenaire_id,
      montant_promis,
      montant_verse: montant_verse || 0,
      date_engagement,
      date_versement,
      reference,
      statut: statut || "Promesse",
      notes,
    });

    res.status(201).json({
      message: "Financement créé avec succès !",
      financement,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Modifier un financement
const updateFinancement = async (req, res) => {
  try {
    const financement = await Financement.findByPk(req.params.id);
    if (!financement) {
      return res.status(404).json({ message: "Financement non trouvé." });
    }
    await financement.update(req.body);
    res.json({ message: "Financement mis à jour avec succès !", financement });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Supprimer un financement
const deleteFinancement = async (req, res) => {
  try {
    const financement = await Financement.findByPk(req.params.id);
    if (!financement) {
      return res.status(404).json({ message: "Financement non trouvé." });
    }
    await financement.destroy();
    res.json({ message: "Financement supprimé avec succès !" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Statistiques financières d'un projet
const getStatsFinancement = async (req, res) => {
  try {
    const financements = await Financement.findAll({
      where: { projet_id: req.params.projet_id },
    });

    const projet = await Projet.findByPk(req.params.projet_id);
    if (!projet) {
      return res.status(404).json({ message: "Projet non trouvé." });
    }

    const total_promis = financements.reduce(
      (sum, f) => sum + parseFloat(f.montant_promis),
      0,
    );
    const total_verse = financements.reduce(
      (sum, f) => sum + parseFloat(f.montant_verse),
      0,
    );
    const reste_a_financer = parseFloat(projet.budget_estime) - total_verse;
    const taux_financement =
      (total_verse / parseFloat(projet.budget_estime)) * 100;

    res.json({
      budget_estime: projet.budget_estime,
      total_promis,
      total_verse,
      reste_a_financer,
      taux_financement: Math.round(taux_financement),
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = {
  getFinancements,
  createFinancement,
  updateFinancement,
  deleteFinancement,
  getStatsFinancement,
};

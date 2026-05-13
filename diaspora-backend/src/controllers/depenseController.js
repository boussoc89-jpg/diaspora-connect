const { Depense, User, Projet } = require("../models/index");

// Lister toutes les dépenses
const getDepenses = async (req, res) => {
  try {
    const depenses = await Depense.findAll({
      include: [
        { model: User, as: "createur", attributes: ["nom", "prenom"] },
        { model: Projet, as: "projet", attributes: ["titre"] },
      ],
      order: [["date_depense", "DESC"]],
    });
    const total = depenses.reduce((sum, d) => sum + parseFloat(d.montant), 0);
    res.json({ depenses, total });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Créer une dépense
const createDepense = async (req, res) => {
  try {
    const { titre, montant, date_depense, motif, projet_id, categorie } =
      req.body;
    const depense = await Depense.create({
      titre,
      montant,
      date_depense,
      motif,
      projet_id: projet_id || null,
      categorie,
      created_by: req.user.id,
    });
    res.status(201).json({ message: "Dépense enregistrée !", depense });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Modifier une dépense
const updateDepense = async (req, res) => {
  try {
    const depense = await Depense.findByPk(req.params.id);
    if (!depense)
      return res.status(404).json({ message: "Dépense non trouvée." });
    await depense.update(req.body);
    res.json({ message: "Dépense mise à jour !", depense });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Supprimer une dépense
const deleteDepense = async (req, res) => {
  try {
    const depense = await Depense.findByPk(req.params.id);
    if (!depense)
      return res.status(404).json({ message: "Dépense non trouvée." });
    await depense.destroy();
    res.json({ message: "Dépense supprimée !" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Statistiques dépenses
const getStatsDepenses = async (req, res) => {
  try {
    const depenses = await Depense.findAll();
    const total = depenses.reduce((sum, d) => sum + parseFloat(d.montant), 0);
    const parCategorie = depenses.reduce((acc, d) => {
      if (!acc[d.categorie]) acc[d.categorie] = 0;
      acc[d.categorie] += parseFloat(d.montant);
      return acc;
    }, {});
    res.json({ total, parCategorie });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = {
  getDepenses,
  createDepense,
  updateDepense,
  deleteDepense,
  getStatsDepenses,
};

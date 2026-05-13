const { Cotisation, User } = require("../models/index");

// Lister toutes les cotisations
const getCotisations = async (req, res) => {
  try {
    const cotisations = await Cotisation.findAll({
      include: [
        { model: User, as: "membre", attributes: ["nom", "prenom", "email"] },
      ],
      order: [["date_versement", "DESC"]],
    });
    res.json({ cotisations });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Cotisations par membre
const getCotisationsByMembre = async (req, res) => {
  try {
    const cotisations = await Cotisation.findAll({
      where: { user_id: req.params.user_id },
      include: [{ model: User, as: "membre", attributes: ["nom", "prenom"] }],
      order: [["date_versement", "DESC"]],
    });
    const total = cotisations.reduce(
      (sum, c) => sum + parseFloat(c.montant),
      0,
    );
    res.json({ cotisations, total });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Créer une cotisation
const createCotisation = async (req, res) => {
  try {
    const { user_id, montant, date_versement, mois, annee, notes, statut } =
      req.body;
    const cotisation = await Cotisation.create({
      user_id,
      montant,
      date_versement,
      mois,
      annee,
      notes,
      statut,
    });
    res.status(201).json({ message: "Cotisation enregistrée !", cotisation });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Modifier une cotisation
const updateCotisation = async (req, res) => {
  try {
    const cotisation = await Cotisation.findByPk(req.params.id);
    if (!cotisation)
      return res.status(404).json({ message: "Cotisation non trouvée." });
    await cotisation.update(req.body);
    res.json({ message: "Cotisation mise à jour !", cotisation });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Supprimer une cotisation
const deleteCotisation = async (req, res) => {
  try {
    const cotisation = await Cotisation.findByPk(req.params.id);
    if (!cotisation)
      return res.status(404).json({ message: "Cotisation non trouvée." });
    await cotisation.destroy();
    res.json({ message: "Cotisation supprimée !" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Statistiques cotisations
const getStatsCotisations = async (req, res) => {
  try {
    const cotisations = await Cotisation.findAll({
      include: [{ model: User, as: "membre", attributes: ["nom", "prenom"] }],
    });
    const total = cotisations.reduce(
      (sum, c) => sum + parseFloat(c.montant),
      0,
    );
    const parMembre = cotisations.reduce((acc, c) => {
      const key = c.user_id;
      if (!acc[key]) {
        acc[key] = {
          membre: `${c.membre.prenom} ${c.membre.nom}`,
          total: 0,
          nb: 0,
        };
      }
      acc[key].total += parseFloat(c.montant);
      acc[key].nb++;
      return acc;
    }, {});
    res.json({ total, parMembre: Object.values(parMembre) });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = {
  getCotisations,
  getCotisationsByMembre,
  createCotisation,
  updateCotisation,
  deleteCotisation,
  getStatsCotisations,
};

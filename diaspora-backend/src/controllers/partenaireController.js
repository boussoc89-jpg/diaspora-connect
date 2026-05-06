const { Partenaire, Financement, Projet } = require("../models/index");

// Lister tous les partenaires
const getPartenaires = async (req, res) => {
  try {
    const partenaires = await Partenaire.findAll({
      order: [["created_at", "DESC"]],
    });
    res.json({ partenaires });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Voir un partenaire en détail
const getPartenaire = async (req, res) => {
  try {
    const partenaire = await Partenaire.findByPk(req.params.id, {
      include: [
        {
          model: Financement,
          as: "financements",
          include: [{ model: Projet, as: "projet", attributes: ["titre"] }],
        },
      ],
    });
    if (!partenaire) {
      return res.status(404).json({ message: "Partenaire non trouvé." });
    }
    res.json({ partenaire });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Créer un partenaire
const createPartenaire = async (req, res) => {
  try {
    const {
      denomination,
      type_partenaire,
      contact_nom,
      contact_email,
      telephone,
      adresse,
      notes,
    } = req.body;

    const partenaire = await Partenaire.create({
      denomination,
      type_partenaire,
      contact_nom,
      contact_email,
      telephone,
      adresse,
      notes,
    });

    res.status(201).json({
      message: "Partenaire créé avec succès !",
      partenaire,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Modifier un partenaire
const updatePartenaire = async (req, res) => {
  try {
    const partenaire = await Partenaire.findByPk(req.params.id);
    if (!partenaire) {
      return res.status(404).json({ message: "Partenaire non trouvé." });
    }
    await partenaire.update(req.body);
    res.json({ message: "Partenaire mis à jour avec succès !", partenaire });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Supprimer un partenaire
const deletePartenaire = async (req, res) => {
  try {
    const partenaire = await Partenaire.findByPk(req.params.id);
    if (!partenaire) {
      return res.status(404).json({ message: "Partenaire non trouvé." });
    }
    await partenaire.destroy();
    res.json({ message: "Partenaire supprimé avec succès !" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = {
  getPartenaires,
  getPartenaire,
  createPartenaire,
  updatePartenaire,
  deletePartenaire,
};

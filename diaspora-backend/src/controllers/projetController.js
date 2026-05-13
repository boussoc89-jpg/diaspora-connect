const { Projet, User, Financement } = require("../models/index");

// Lister tous les projets
const getProjets = async (req, res) => {
  try {
    const projets = await Projet.findAll({
      include: [
        { model: User, as: "createur", attributes: ["nom", "prenom"] },
        { model: Financement, as: "financements" },
      ],
      order: [["created_at", "DESC"]],
    });

    // Tri côté serveur par statut
    const ordre = {
      "En cours de réalisation": 1,
      "En recherche de financement": 2,
      Financé: 3,
      Identifié: 4,
      Terminé: 5,
      Archivé: 6,
    };

    projets.sort((a, b) => {
      const ordreA = ordre[a.statut] || 7;
      const ordreB = ordre[b.statut] || 7;
      return ordreA - ordreB;
    });

    res.json({ projets });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Voir un projet en détail
const getProjet = async (req, res) => {
  try {
    const projet = await Projet.findByPk(req.params.id, {
      include: [
        { model: User, as: "createur", attributes: ["nom", "prenom"] },
        { model: Financement, as: "financements" },
      ],
    });
    if (!projet) {
      return res.status(404).json({ message: "Projet non trouvé." });
    }
    res.json({ projet });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Créer un projet
const createProjet = async (req, res) => {
  try {
    const {
      titre,
      description,
      village,
      region,
      type_besoin,
      budget_estime,
      nb_beneficiaires,
      statut,
      priorite,
      objectifs,
    } = req.body;

    const projet = await Projet.create({
      titre,
      description,
      village,
      region,
      type_besoin,
      budget_estime,
      nb_beneficiaires,
      statut,
      priorite,
      objectifs,
      created_by: req.user.id,
    });

    res.status(201).json({
      message: "Projet créé avec succès !",
      projet,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Modifier un projet
const updateProjet = async (req, res) => {
  try {
    const projet = await Projet.findByPk(req.params.id);
    if (!projet) {
      return res.status(404).json({ message: "Projet non trouvé." });
    }
    await projet.update(req.body);
    res.json({ message: "Projet mis à jour avec succès !", projet });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Supprimer un projet
const deleteProjet = async (req, res) => {
  try {
    const projet = await Projet.findByPk(req.params.id);
    if (!projet) {
      return res.status(404).json({ message: "Projet non trouvé." });
    }
    await projet.destroy();
    res.json({ message: "Projet supprimé avec succès !" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = {
  getProjets,
  getProjet,
  createProjet,
  updateProjet,
  deleteProjet,
};

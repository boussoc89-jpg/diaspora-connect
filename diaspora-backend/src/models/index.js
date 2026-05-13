const sequelize = require("../config/database");
const User = require("./User");
const Projet = require("./Projet");
const Partenaire = require("./Partenaire");
const Financement = require("./Financement");
const Cotisation = require("./Cotisation");
const Depense = require("./Depense");

// Vérification des modèles
console.log("Modèles chargés:", {
  User: !!User,
  Projet: !!Projet,
  Partenaire: !!Partenaire,
  Financement: !!Financement,
  Cotisation: !!Cotisation,
  Depense: !!Depense,
});

// Relations User - Projet
User.hasMany(Projet, { foreignKey: "created_by", as: "projets" });
Projet.belongsTo(User, { foreignKey: "created_by", as: "createur" });

// Relations Projet - Financement
Projet.hasMany(Financement, { foreignKey: "projet_id", as: "financements" });
Financement.belongsTo(Projet, { foreignKey: "projet_id", as: "projet" });

// Relations Partenaire - Financement
Partenaire.hasMany(Financement, {
  foreignKey: "partenaire_id",
  as: "financements",
});
Financement.belongsTo(Partenaire, {
  foreignKey: "partenaire_id",
  as: "partenaire",
});

// Relations User - Cotisation
User.hasMany(Cotisation, { foreignKey: "user_id", as: "cotisations" });
Cotisation.belongsTo(User, { foreignKey: "user_id", as: "membre" });

// Relations Projet - Depense
Projet.hasMany(Depense, { foreignKey: "projet_id", as: "depenses" });
Depense.belongsTo(Projet, { foreignKey: "projet_id", as: "projet" });

// Relations User - Depense
User.hasMany(Depense, { foreignKey: "created_by", as: "depenses" });
Depense.belongsTo(User, { foreignKey: "created_by", as: "createur" });

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Tables synchronisées avec la base de données !");
  } catch (error) {
    console.error("❌ Erreur de synchronisation :", error.message);
  }
};

module.exports = {
  sequelize,
  User,
  Projet,
  Partenaire,
  Financement,
  Cotisation,
  Depense,
  syncDatabase,
};

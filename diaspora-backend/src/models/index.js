const sequelize = require("../config/database");
const User = require("./User");
const Projet = require("./Projet");
const Partenaire = require("./Partenaire");
const Financement = require("./Financement");

// Relations entre les modèles
// Un User peut créer plusieurs Projets
User.hasMany(Projet, { foreignKey: "created_by", as: "projets" });
Projet.belongsTo(User, { foreignKey: "created_by", as: "createur" });

// Un Projet peut avoir plusieurs Financements
Projet.hasMany(Financement, { foreignKey: "projet_id", as: "financements" });
Financement.belongsTo(Projet, { foreignKey: "projet_id", as: "projet" });

// Un Partenaire peut avoir plusieurs Financements
Partenaire.hasMany(Financement, {
  foreignKey: "partenaire_id",
  as: "financements",
});
Financement.belongsTo(Partenaire, {
  foreignKey: "partenaire_id",
  as: "partenaire",
});

// Synchroniser les modèles avec la base de données
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
  syncDatabase,
};

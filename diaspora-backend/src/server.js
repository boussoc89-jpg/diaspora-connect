require("dotenv").config();
const app = require("./app");
const { sequelize, syncDatabase } = require("./models/index");
const seedData = require("./config/seedData");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Base de données connectée !");

    await syncDatabase();

    // Insérer les données de démonstration
    await seedData();

    app.listen(PORT, () => {
      console.log(`🚀 Serveur DAS_connect démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Erreur de démarrage :", error.message);
  }
};

startServer();

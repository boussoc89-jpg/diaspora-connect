require("dotenv").config();
const app = require("./app");
const { sequelize, syncDatabase } = require("./models/index");

const PORT = process.env.PORT || 5000;

// Démarrage du serveur
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Base de données connectée !");

    await syncDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Serveur DiasporaConnect démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Erreur de démarrage :", error.message);
  }
};

startServer();

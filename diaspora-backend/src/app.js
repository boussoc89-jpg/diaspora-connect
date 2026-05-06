const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const projetRoutes = require("./routes/projetRoutes");

const app = express();

// Middlewares de sécurité
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projets", projetRoutes);

// Route de test
app.get("/", (req, res) => {
  res.json({
    message: "DiasporaConnect API fonctionne !",
    version: "1.0.0",
  });
});

module.exports = app;

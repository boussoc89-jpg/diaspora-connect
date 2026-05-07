const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const projetRoutes = require("./routes/projetRoutes");
const partenaireRoutes = require("./routes/partenaireRoutes");
const financementRoutes = require("./routes/financementRoutes");

const app = express();

// Middlewares de sécurité
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projets", projetRoutes);
app.use("/api/partenaires", partenaireRoutes);
app.use("/api/financements", financementRoutes);

// Route de test
app.get("/", (req, res) => {
  res.json({
    message: "DiasporaConnect API fonctionne !",
    version: "1.0.0",
  });
});

module.exports = app;

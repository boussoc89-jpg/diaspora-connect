const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const projetRoutes = require("./routes/projetRoutes");
const partenaireRoutes = require("./routes/partenaireRoutes");
const financementRoutes = require("./routes/financementRoutes");
const exportRoutes = require("./routes/exportRoutes");
const cotisationRoutes = require("./routes/cotisationRoutes");
const depenseRoutes = require("./routes/depenseRoutes");

const app = express();

// Middlewares de sécurité
app.use(helmet());
app.use(
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    }),
  ),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projets", projetRoutes);
app.use("/api/partenaires", partenaireRoutes);
app.use("/api/financements", financementRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/cotisations", cotisationRoutes);
app.use("/api/depenses", depenseRoutes);

// Route de test
app.get("/", (req, res) => {
  res.json({
    message: "DAS_connect API fonctionne !",
    version: "1.0.0",
  });
});

module.exports = app;

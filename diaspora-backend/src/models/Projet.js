const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Projet = sequelize.define(
  "Projet",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titre: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    village: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type_besoin: {
      type: DataTypes.ENUM("eau", "éducation", "santé", "agriculture", "autre"),
      allowNull: false,
    },
    budget_estime: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    nb_beneficiaires: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    statut: {
      type: DataTypes.ENUM(
        "Identifié",
        "En recherche de financement",
        "Financé",
        "En cours de réalisation",
        "Terminé",
        "Archivé",
      ),
      defaultValue: "Identifié",
    },
    priorite: {
      type: DataTypes.ENUM("haute", "moyenne", "basse"),
      defaultValue: "moyenne",
    },
    objectifs: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "projets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = Projet;

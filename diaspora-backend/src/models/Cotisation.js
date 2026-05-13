const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cotisation = sequelize.define(
  "Cotisation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    montant: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    date_versement: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    mois: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    annee: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM("payé", "en attente", "annulé"),
      defaultValue: "payé",
    },
  },
  {
    tableName: "cotisations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

module.exports = Cotisation;

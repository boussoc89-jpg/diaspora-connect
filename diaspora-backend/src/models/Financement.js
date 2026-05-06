const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Financement = sequelize.define(
  "Financement",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    projet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    partenaire_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    montant_promis: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    montant_verse: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    date_engagement: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    date_versement: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    reference: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM(
        "Promesse",
        "Versement partiel",
        "Versement total",
        "Annulé",
      ),
      defaultValue: "Promesse",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "financements",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

module.exports = Financement;

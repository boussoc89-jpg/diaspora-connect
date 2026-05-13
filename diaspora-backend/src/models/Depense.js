const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Depense = sequelize.define(
  "Depense",
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
    montant: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    date_depense: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    motif: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    projet_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    categorie: {
      type: DataTypes.ENUM(
        "Projet",
        "Fonctionnement",
        "Communication",
        "Transport",
        "Autre",
      ),
      defaultValue: "Autre",
    },
  },
  {
    tableName: "depenses",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

module.exports = Depense;

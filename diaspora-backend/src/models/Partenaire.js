const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Partenaire = sequelize.define(
  "Partenaire",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    denomination: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    type_partenaire: {
      type: DataTypes.ENUM(
        "Fondation",
        "Mairie",
        "Entreprise",
        "Collectivité",
        "Donateur privé",
      ),
      allowNull: false,
    },
    contact_nom: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    contact_email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    adresse: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "partenaires",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

module.exports = Partenaire;

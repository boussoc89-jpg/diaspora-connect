const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/index");

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Inscription
const register = async (req, res) => {
  try {
    const { nom, prenom, email, password, role } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: "Cet email est déjà utilisé.",
      });
    }

    // Hacher le mot de passe
    const password_hash = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = await User.create({
      nom,
      prenom,
      email,
      password_hash,
      role: role || "membre",
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: "Compte créé avec succès !",
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// Connexion
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect.",
      });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect.",
      });
    }

    // Vérifier si le compte est actif
    if (!user.actif) {
      return res.status(401).json({
        message: "Compte désactivé. Contactez l administrateur.",
      });
    }

    const token = generateToken(user.id);

    res.json({
      message: "Connexion réussie !",
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// Profil utilisateur connecté
const getProfile = async (req, res) => {
  res.json({
    user: req.user,
  });
};

module.exports = { register, login, getProfile };

const jwt = require("jsonwebtoken");
const { User } = require("../models/index");

// Vérifier le token JWT
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Accès refusé. Token manquant.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password_hash"] },
    });

    if (!req.user || !req.user.actif) {
      return res.status(401).json({
        message: "Utilisateur non trouvé ou désactivé.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token invalide ou expiré.",
    });
  }
};

// Vérifier le rôle
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Accès refusé. Permissions insuffisantes.",
      });
    }
    next();
  };
};

module.exports = { protect, authorize };

# DiasporaConnect

# DAS_connect — Application Web de Gestion de Projets Solidaires

![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/Node.js-20+-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)

---

## 📋 Présentation du projet

**DAS_connect** est une application web centralisée développée pour l'**Association Diaspora Action Sénégalais en France**. Elle permet de gérer, suivre et piloter les projets de développement solidaires menés dans les villages et quartiers du Sénégal.

Ce projet a été réalisé dans le cadre d'un **projet de fin d'études de Bachelor 3 Développement Web — 2025/2026**.

---

## 🎯 Objectifs

- Centraliser les fiches projets et les besoins identifiés
- Suivre en temps réel l'état de financement de chaque projet
- Gérer les partenaires et donateurs avec historique des contributions
- Faciliter la génération de rapports PDF et exports Excel
- Offrir un accès sécurisé avec gestion des rôles et droits

---

## 🛠️ Stack Technologique

### Frontend

| Technologie  | Version | Rôle          |
| ------------ | ------- | ------------- |
| React.js     | 18      | Framework UI  |
| Vite         | 6       | Bundler       |
| Tailwind CSS | 4       | Styles        |
| React Router | 6       | Navigation    |
| Recharts     | 2       | Graphiques    |
| Axios        | 1       | Requêtes HTTP |

### Backend

| Technologie | Version | Rôle                  |
| ----------- | ------- | --------------------- |
| Node.js     | 20+     | Runtime               |
| Express.js  | 4       | Framework API REST    |
| Sequelize   | 6       | ORM                   |
| MySQL       | 8       | Base de données       |
| JWT         | -       | Authentification      |
| bcryptjs    | -       | Hachage mots de passe |
| PDFKit      | -       | Génération PDF        |
| ExcelJS     | -       | Export Excel          |

---

## 📁 Structure du projet

diaspora-connect/
├── diaspora-backend/ # API REST Node.js
│ ├── src/
│ │ ├── config/ # Configuration BDD + données demo
│ │ ├── controllers/ # Logique métier
│ │ ├── middleware/ # Auth JWT + rôles
│ │ ├── models/ # Modèles Sequelize
│ │ └── routes/ # Routes API
│ ├── .env # Variables d environnement
│ └── package.json
│
├── diaspora-frontend/ # Application React
│ ├── src/
│ │ ├── components/ # Composants réutilisables
│ │ ├── context/ # Contexte Auth
│ │ ├── pages/ # Pages de l application
│ │ └── services/ # Services API
│ └── package.json
│
└── README.md

---

## ⚙️ Installation et démarrage

### Prérequis

- Node.js 20+
- MySQL 8 (XAMPP recommandé)
- Git

### 1. Cloner le projet

```bash
git clone https://github.com/boussoc89-jpg/diaspora-connect.git
cd diaspora-connect
```

### 2. Configurer le Backend

```bash
cd diaspora-backend
npm install
```

Créez le fichier `.env` :

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=diaspora_connect
JWT_SECRET=diaspora_secret_key_2025
JWT_EXPIRE=2h
```

### 3. Configurer la Base de données

- Démarrez MySQL via XAMPP
- Créez une base de données nommée `diaspora_connect`
- Les tables sont créées automatiquement au démarrage

### 4. Démarrer le Backend

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:5000`

### 5. Configurer le Frontend

```bash
cd ../diaspora-frontend
npm install
npm run dev
```

L'application démarre sur `http://localhost:5173`

---

## 👥 Comptes de démonstration

| Rôle               | Email                 | Mot de passe | Droits                  |
| ------------------ | --------------------- | ------------ | ----------------------- |
| **Administrateur** | admin@diaspora.fr     | Admin1234    | Accès complet           |
| **Membre actif**   | membre@dasconnect.fr  | Demo1234     | Créer/Modifier          |
| **Lecteur**        | lecteur@dasconnect.fr | Demo1234     | Consultation uniquement |

---

## 🔐 Sécurité

- Authentification par **JWT** (expiration 2h)
- Mots de passe hachés avec **bcrypt** (saltRounds = 12)
- Protection **CORS** configurée
- Protection **XSS** via Helmet
- Gestion des **rôles et droits** sur chaque route

---

## 📊 Fonctionnalités

### ✅ Gestion des Projets

- Création, modification, consultation, suppression
- Filtres par statut, priorité, type de besoin
- Recherche par titre, localité ou région
- Export PDF de la fiche projet

### ✅ Gestion des Partenaires

- Fiche partenaire complète
- Types : Fondation, Mairie, Entreprise, Collectivité, Donateur privé
- Historique des contributions

### ✅ Suivi Financier

- Enregistrement des promesses et versements
- Calcul automatique du taux de financement
- Indicateur coloré (rouge/orange/vert)
- Barre de progression visuelle

### ✅ Tableau de Bord

- Indicateurs clés en temps réel
- Graphiques : statuts, priorités, budgets par type
- Vue synthétique des projets récents

### ✅ Gestion des Utilisateurs

- 3 rôles : Administrateur, Membre, Lecteur
- Activation/désactivation des comptes
- Accès réservé à l administrateur

### ✅ Export de Données

- Export PDF par projet
- Export Excel de tous les projets

---

## 🗄️ Modèle de données

USERS ──────────────── PROJETS
| |
| |
└──── created_by └──── FINANCEMENTS
|
PARTENAIRES ─────────────────────────

### Tables principales

- **users** : Utilisateurs et rôles
- **projets** : Fiches projets avec budget et statut
- **partenaires** : Organisations et donateurs
- **financements** : Promesses et versements

---

## 📡 API REST — Endpoints principaux

### Authentification

POST /api/auth/login Connexion
POST /api/auth/register Inscription
GET /api/auth/profile Profil connecté
GET /api/auth/users Liste utilisateurs (admin)

### Projets

GET /api/projets Liste des projets
GET /api/projets/:id Détail d un projet
POST /api/projets Créer un projet
PUT /api/projets/:id Modifier un projet
DELETE /api/projets/:id Supprimer un projet

### Partenaires

GET /api/partenaires Liste des partenaires
POST /api/partenaires Créer un partenaire
PUT /api/partenaires/:id Modifier un partenaire
DELETE /api/partenaires/:id Supprimer un partenaire

### Financements

GET /api/financements/projet/:id Financements d un projet
GET /api/financements/stats/:id Statistiques financières
POST /api/financements Créer un financement
PUT /api/financements/:id Modifier un financement

### Export

GET /api/export/projet/:id/pdf Export PDF
GET /api/export/projets/excel Export Excel

---

## 🗓️ Planning de réalisation

| Phase | Description              | Durée      |
| ----- | ------------------------ | ---------- |
| 1     | Setup et architecture    | 1 semaine  |
| 2     | Backend Node.js/Express  | 4 semaines |
| 3     | Frontend React           | 4 semaines |
| 4     | Modules avancés          | 2 semaines |
| 5     | Tests et débogage        | 2 semaines |
| 6     | Déploiement et livrables | 3 semaines |

---

## 👨‍💻 Auteur

**Bousso Cissé**
Étudiant en Bachelor 3 Développement Web — 2025/2026

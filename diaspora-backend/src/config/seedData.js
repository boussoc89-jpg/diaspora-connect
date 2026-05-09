const { User, Projet, Partenaire, Financement } = require("../models/index");
const bcrypt = require("bcryptjs");

const seedData = async () => {
  try {
    console.log("🌱 Insertion des données de démonstration...");

    // Créer des utilisateurs
    const password = await bcrypt.hash("Demo1234", 12);

    const membre = await User.findOrCreate({
      where: { email: "membre@dasconnect.fr" },
      defaults: {
        nom: "Diallo",
        prenom: "Aminata",
        email: "membre@dasconnect.fr",
        password_hash: password,
        role: "membre",
        actif: true,
      },
    });

    const lecteur = await User.findOrCreate({
      where: { email: "lecteur@dasconnect.fr" },
      defaults: {
        nom: "Ndiaye",
        prenom: "Ibrahima",
        email: "lecteur@dasconnect.fr",
        password_hash: password,
        role: "lecteur",
        actif: true,
      },
    });

    // Créer des partenaires
    const [fondation] = await Partenaire.findOrCreate({
      where: { denomination: "Fondation Agir pour le Sénégal" },
      defaults: {
        denomination: "Fondation Agir pour le Sénégal",
        type_partenaire: "Fondation",
        contact_nom: "Marie Dupont",
        contact_email: "contact@agir-senegal.fr",
        telephone: "0612345678",
        adresse: "12 rue de la Paix, Paris 75001",
        notes: "Partenaire principal depuis 2019",
      },
    });

    const [mairie] = await Partenaire.findOrCreate({
      where: { denomination: "Mairie de Saint-Denis" },
      defaults: {
        denomination: "Mairie de Saint-Denis",
        type_partenaire: "Mairie",
        contact_nom: "Pierre Martin",
        contact_email: "cooperation@mairie-saint-denis.fr",
        telephone: "0145678901",
        adresse: "2 Place du Caquet, Saint-Denis 93200",
        notes: "Convention de coopération signée en 2021",
      },
    });

    const [entreprise] = await Partenaire.findOrCreate({
      where: { denomination: "Orange Solidarité" },
      defaults: {
        denomination: "Orange Solidarité",
        type_partenaire: "Entreprise",
        contact_nom: "Sophie Bernard",
        contact_email: "solidarite@orange.fr",
        telephone: "0156789012",
        adresse: "78 rue Olivier de Serres, Paris 75015",
        notes: "Sponsor depuis 2022",
      },
    });

    const [collectivite] = await Partenaire.findOrCreate({
      where: { denomination: "Conseil Régional Île-de-France" },
      defaults: {
        denomination: "Conseil Régional Île-de-France",
        type_partenaire: "Collectivité",
        contact_nom: "Jean Lefebvre",
        contact_email: "cooperation@iledefrance.fr",
        telephone: "0157890123",
        adresse: "33 rue Barbet de Jouy, Paris 75007",
        notes: "Subvention annuelle pour projets eau et éducation",
      },
    });

    const [donateur] = await Partenaire.findOrCreate({
      where: { denomination: "Association des Sénégalais de Lyon" },
      defaults: {
        denomination: "Association des Sénégalais de Lyon",
        type_partenaire: "Donateur privé",
        contact_nom: "Moussa Cissé",
        contact_email: "contact@asl-lyon.fr",
        telephone: "0478901234",
        adresse: "15 rue de la République, Lyon 69001",
        notes: "Collecte annuelle auprès des membres",
      },
    });

    // Créer des projets
    const [projet1] = await Projet.findOrCreate({
      where: { titre: "Forage et adduction d eau potable" },
      defaults: {
        titre: "Forage et adduction d eau potable",
        description:
          "Construction d un forage équipé d une pompe solaire pour alimenter en eau potable le village de Ndoffane. Le projet inclut la pose de canalisations et l installation de 3 bornes fontaines publiques.",
        village: "Ndoffane",
        region: "Kaolack",
        type_besoin: "eau",
        budget_estime: 25000,
        nb_beneficiaires: 1200,
        statut: "En cours de réalisation",
        priorite: "haute",
        objectifs:
          "Fournir un accès permanent à l eau potable à 1200 habitants. Réduire les maladies hydriques de 60%.",
        created_by: 1,
      },
    });

    const [projet2] = await Projet.findOrCreate({
      where: { titre: "Construction de 3 salles de classe" },
      defaults: {
        titre: "Construction de 3 salles de classe",
        description:
          "Construction de 3 nouvelles salles de classe équipées à l école primaire de Gossas pour accueillir 120 élèves supplémentaires. Inclut mobilier, tableau et matériel scolaire.",
        village: "Gossas",
        region: "Diourbel",
        type_besoin: "éducation",
        budget_estime: 35000,
        nb_beneficiaires: 350,
        statut: "En recherche de financement",
        priorite: "haute",
        objectifs:
          "Scolariser 120 enfants supplémentaires. Réduire les classes surchargées de 45 à 30 élèves.",
        created_by: 1,
      },
    });

    const [projet3] = await Projet.findOrCreate({
      where: { titre: "Équipement du poste de santé de Mbirkilane" },
      defaults: {
        titre: "Équipement du poste de santé de Mbirkilane",
        description:
          "Acquisition d équipements médicaux essentiels pour le poste de santé : lit d accouchement, matériel de consultation, médicaments de base et groupe électrogène.",
        village: "Mbirkilane",
        region: "Kaffrine",
        type_besoin: "santé",
        budget_estime: 18000,
        nb_beneficiaires: 5000,
        statut: "Financé",
        priorite: "haute",
        objectifs:
          "Améliorer la prise en charge médicale de 5000 habitants. Réduire la mortalité maternelle.",
        created_by: 1,
      },
    });

    const [projet4] = await Projet.findOrCreate({
      where: { titre: "Aménagement d un périmètre maraîcher" },
      defaults: {
        titre: "Aménagement d un périmètre maraîcher",
        description:
          "Aménagement d un périmètre maraîcher de 2 hectares pour les femmes du groupement de Koungheul. Inclut clôture, système d irrigation goutte-à-goutte et formation agricole.",
        village: "Koungheul",
        region: "Kaffrine",
        type_besoin: "agriculture",
        budget_estime: 12000,
        nb_beneficiaires: 80,
        statut: "Identifié",
        priorite: "moyenne",
        objectifs:
          "Autonomiser 80 femmes. Générer des revenus stables pour 80 familles.",
        created_by: 1,
      },
    });

    const [projet5] = await Projet.findOrCreate({
      where: { titre: "Laverie solaire pour femmes de Diourbel" },
      defaults: {
        titre: "Laverie solaire pour femmes de Diourbel",
        description:
          "Installation d une laverie équipée de machines à laver solaires pour le groupement de femmes de Diourbel. Projet générateur de revenus avec tarification adaptée.",
        village: "Diourbel",
        region: "Diourbel",
        type_besoin: "autre",
        budget_estime: 8000,
        nb_beneficiaires: 200,
        statut: "Terminé",
        priorite: "moyenne",
        objectifs:
          "Créer 5 emplois directs. Alléger les tâches domestiques de 200 femmes.",
        created_by: 1,
      },
    });

    // Créer des financements
    await Financement.findOrCreate({
      where: { projet_id: projet1[0].id, partenaire_id: fondation.id },
      defaults: {
        projet_id: projet1[0].id,
        partenaire_id: fondation.id,
        montant_promis: 15000,
        montant_verse: 15000,
        date_engagement: "2024-03-15",
        date_versement: "2024-04-01",
        reference: "VIR-2024-0412",
        statut: "Versement total",
        notes: "Premier versement reçu",
      },
    });

    await Financement.findOrCreate({
      where: { projet_id: projet1[0].id, partenaire_id: mairie.id },
      defaults: {
        projet_id: projet1[0].id,
        partenaire_id: mairie.id,
        montant_promis: 10000,
        montant_verse: 5000,
        date_engagement: "2024-04-10",
        date_versement: "2024-05-15",
        reference: "VIR-2024-0587",
        statut: "Versement partiel",
        notes: "Deuxième tranche attendue en septembre",
      },
    });

    await Financement.findOrCreate({
      where: { projet_id: projet2[0].id, partenaire_id: collectivite.id },
      defaults: {
        projet_id: projet2[0].id,
        partenaire_id: collectivite.id,
        montant_promis: 20000,
        montant_verse: 0,
        date_engagement: "2024-06-01",
        date_versement: null,
        reference: null,
        statut: "Promesse",
        notes: "Dossier soumis en commission",
      },
    });

    await Financement.findOrCreate({
      where: { projet_id: projet3[0].id, partenaire_id: entreprise.id },
      defaults: {
        projet_id: projet3[0].id,
        partenaire_id: entreprise.id,
        montant_promis: 18000,
        montant_verse: 18000,
        date_engagement: "2024-01-20",
        date_versement: "2024-02-10",
        reference: "VIR-2024-0198",
        statut: "Versement total",
        notes: "Financement complet reçu",
      },
    });

    await Financement.findOrCreate({
      where: { projet_id: projet5[0].id, partenaire_id: donateur.id },
      defaults: {
        projet_id: projet5[0].id,
        partenaire_id: donateur.id,
        montant_promis: 8000,
        montant_verse: 8000,
        date_engagement: "2023-09-01",
        date_versement: "2023-10-15",
        reference: "VIR-2023-1045",
        statut: "Versement total",
        notes: "Projet terminé avec succès",
      },
    });

    console.log("✅ Données de démonstration insérées avec succès !");
    console.log("👤 Comptes créés :");
    console.log("   - Admin : admin@diaspora.fr / Admin1234");
    console.log("   - Membre : membre@dasconnect.fr / Demo1234");
    console.log("   - Lecteur : lecteur@dasconnect.fr / Demo1234");
  } catch (error) {
    console.error("❌ Erreur lors de l insertion des données :", error.message);
  }
};

module.exports = seedData;

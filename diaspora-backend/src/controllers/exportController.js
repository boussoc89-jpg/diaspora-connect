const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const { Projet, Partenaire, Financement } = require("../models/index");

// Export PDF d'un projet
const exportProjetPDF = async (req, res) => {
  try {
    const projet = await Projet.findByPk(req.params.id, {
      include: [
        {
          model: Financement,
          as: "financements",
          include: [{ model: Partenaire, as: "partenaire" }],
        },
      ],
    });

    if (!projet) {
      return res.status(404).json({ message: "Projet non trouvé." });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=projet-${projet.id}.pdf`,
    );
    doc.pipe(res);

    // En-tête
    doc
      .fontSize(20)
      .fillColor("#16a34a")
      .text("DAS_connect", { align: "center" });
    doc
      .fontSize(14)
      .fillColor("#000000")
      .text("Fiche Projet", { align: "center" });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Informations générales
    doc.fontSize(16).fillColor("#16a34a").text("Informations générales");
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#000000");
    doc.text(`Titre : ${projet.titre}`);
    doc.text(`Village : ${projet.village}`);
    doc.text(`Région : ${projet.region}`);
    doc.text(`Type de besoin : ${projet.type_besoin}`);
    doc.text(`Priorité : ${projet.priorite}`);
    doc.text(`Statut : ${projet.statut}`);
    doc.text(`Nombre de bénéficiaires : ${projet.nb_beneficiaires}`);
    doc.moveDown();

    // Description
    doc.fontSize(16).fillColor("#16a34a").text("Description");
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#000000").text(projet.description);
    doc.moveDown();

    // Objectifs
    if (projet.objectifs) {
      doc.fontSize(16).fillColor("#16a34a").text("Objectifs");
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor("#000000").text(projet.objectifs);
      doc.moveDown();
    }

    // Budget
    doc.fontSize(16).fillColor("#16a34a").text("Suivi financier");
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#000000");
    const totalVerse = projet.financements.reduce(
      (sum, f) => sum + parseFloat(f.montant_verse || 0),
      0,
    );
    const totalPromis = projet.financements.reduce(
      (sum, f) => sum + parseFloat(f.montant_promis || 0),
      0,
    );
    doc.text(
      `Budget estimé : ${parseFloat(projet.budget_estime).toLocaleString("fr-FR")} €`,
    );
    doc.text(`Total promis : ${totalPromis.toLocaleString("fr-FR")} €`);
    doc.text(`Total versé : ${totalVerse.toLocaleString("fr-FR")} €`);
    doc.text(
      `Reste à financer : ${(parseFloat(projet.budget_estime) - totalVerse).toLocaleString("fr-FR")} €`,
    );
    doc.moveDown();

    // Partenaires
    if (projet.financements.length > 0) {
      doc.fontSize(16).fillColor("#16a34a").text("Partenaires et financements");
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor("#000000");
      projet.financements.forEach((f) => {
        doc.text(
          `• ${f.partenaire?.denomination} : ${parseFloat(f.montant_verse).toLocaleString("fr-FR")} € versés / ${parseFloat(f.montant_promis).toLocaleString("fr-FR")} € promis`,
        );
      });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Export Excel de tous les projets
const exportProjetsExcel = async (req, res) => {
  try {
    const projets = await Projet.findAll({
      include: [{ model: Financement, as: "financements" }],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Projets");
    workbook.creator = "DAS_connect";
    workbook.title = "DAS_connect - Export Projets";

    // En-têtes
    worksheet.columns = [
      { header: "ID", key: "id", width: 5 },
      { header: "Titre", key: "titre", width: 30 },
      { header: "Village", key: "village", width: 20 },
      { header: "Région", key: "region", width: 20 },
      { header: "Type de besoin", key: "type_besoin", width: 15 },
      { header: "Budget estimé (€)", key: "budget_estime", width: 18 },
      { header: "Total versé (€)", key: "total_verse", width: 15 },
      { header: "Reste à financer (€)", key: "reste", width: 18 },
      { header: "Bénéficiaires", key: "nb_beneficiaires", width: 15 },
      { header: "Priorité", key: "priorite", width: 12 },
      { header: "Statut", key: "statut", width: 25 },
    ];

    // Style en-têtes
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF16a34a" },
    };

    // Données
    projets.forEach((projet) => {
      const totalVerse = projet.financements.reduce(
        (sum, f) => sum + parseFloat(f.montant_verse || 0),
        0,
      );
      worksheet.addRow({
        id: projet.id,
        titre: projet.titre,
        village: projet.village,
        region: projet.region,
        type_besoin: projet.type_besoin,
        budget_estime: parseFloat(projet.budget_estime),
        total_verse: totalVerse,
        reste: parseFloat(projet.budget_estime) - totalVerse,
        nb_beneficiaires: projet.nb_beneficiaires,
        priorite: projet.priorite,
        statut: projet.statut,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment; filename=projets.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = { exportProjetPDF, exportProjetsExcel };

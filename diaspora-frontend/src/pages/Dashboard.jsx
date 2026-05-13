import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projetService, partenaireService } from '../services/api';
import { cotisationService, depenseService, financementService } from '../services/api';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#9333ea', '#dc2626', '#6b7280'];

const Dashboard = () => {
  const { user } = useAuth();
  const [projets, setProjets] = useState([]);
  const [partenaires, setPartenaires] = useState([]);
  const [caisse, setCaisse] = useState({
    totalCotisations: 0,
    totalVersements: 0,
    totalDepenses: 0,
    solde: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projetsRes, partenairesRes, cotisationsRes, depensesRes, financementsRes] = await Promise.all([
          projetService.getAll(),
          partenaireService.getAll(),
          cotisationService.getStats(),
          depenseService.getStats(),
          projetService.getAll()
        ]);

        setProjets(projetsRes.data.projets);
        setPartenaires(partenairesRes.data.partenaires);

        // Calcul caisse
        const totalCotisations = cotisationsRes.data.total || 0;
        const totalDepenses = depensesRes.data.total || 0;

        // Total versements partenaires
        const tousLesProjets = financementsRes.data.projets;
        let totalVersements = 0;
        tousLesProjets.forEach(projet => {
          if (projet.financements) {
            projet.financements.forEach(f => {
              totalVersements += parseFloat(f.montant_verse || 0);
            });
          }
        });

        const solde = totalCotisations + totalVersements - totalDepenses;

        setCaisse({
          totalCotisations,
          totalVersements,
          totalDepenses,
          solde
        });

      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Statistiques projets actifs (hors Terminé et Archivé)
  const projetsActifs = projets.filter(p =>
    p.statut !== 'Terminé' && p.statut !== 'Archivé'
  );

  const totalProjets = projets.length;
  const totalBudgetActif = projetsActifs.reduce((sum, p) => {
  const totalVerse = p.financements ? p.financements.reduce((s, f) => s + parseFloat(f.montant_verse || 0), 0) : 0;
  return sum + parseFloat(p.budget_estime || 0) - totalVerse;
}, 0);
  const totalPartenaires = partenaires.length;

  // Données graphiques
  const statutsData = projets.reduce((acc, projet) => {
    const existing = acc.find(item => item.name === projet.statut);
    if (existing) existing.value++;
    else acc.push({ name: projet.statut, value: 1 });
    return acc;
  }, []);

  const besoinsData = projets.reduce((acc, projet) => {
    const existing = acc.find(item => item.name === projet.type_besoin);
    if (existing) existing.budget += parseFloat(projet.budget_estime || 0);
    else acc.push({ name: projet.type_besoin, budget: parseFloat(projet.budget_estime || 0) });
    return acc;
  }, []);

  const prioritesData = [
    { name: 'Haute', value: projets.filter(p => p.priorite === 'haute').length },
    { name: 'Moyenne', value: projets.filter(p => p.priorite === 'moyenne').length },
    { name: 'Basse', value: projets.filter(p => p.priorite === 'basse').length },
  ];

  const getStatutColor = (statut) => {
    const colors = {
      'Identifié': 'bg-gray-100 text-gray-700',
      'En recherche de financement': 'bg-yellow-100 text-yellow-700',
      'Financé': 'bg-blue-100 text-blue-700',
      'En cours de réalisation': 'bg-green-100 text-green-700',
      'Terminé': 'bg-purple-100 text-purple-700',
      'Archivé': 'bg-red-100 text-red-700'
    };
    return colors[statut] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tableau de bord</h1>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Total Projets</p>
          <p className="text-3xl font-bold text-gray-800">{totalProjets}</p>
          <p className="text-xs text-gray-400 mt-1">{projetsActifs.length} actifs</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
  <p className="text-gray-500 text-sm">Reste à financer</p>
  <p className="text-2xl font-bold text-gray-800">
    {totalBudgetActif.toLocaleString('fr-FR')} €
  </p>
  <p className="text-xs text-gray-400 mt-1">Budget - versements reçus</p>
</div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">Partenaires</p>
          <p className="text-3xl font-bold text-gray-800">{totalPartenaires}</p>
          <p className="text-xs text-gray-400 mt-1">Actifs</p>
        </div>
        <div className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${caisse.solde >= 0 ? 'border-green-500' : 'border-red-500'}`}>
          <p className="text-gray-500 text-sm">💰 Caisse</p>
          <p className={`text-2xl font-bold ${caisse.solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {caisse.solde.toLocaleString('fr-FR')} €
          </p>
          <p className="text-xs text-gray-400 mt-1">Solde disponible</p>
        </div>
      </div>

      {/* Détail Caisse */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">🏦 Détail de la Caisse</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">💵 Cotisations membres</p>
            <p className="text-2xl font-bold text-green-600">
              +{caisse.totalCotisations.toLocaleString('fr-FR')} €
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">🤝 Versements partenaires</p>
            <p className="text-2xl font-bold text-blue-600">
              +{caisse.totalVersements.toLocaleString('fr-FR')} €
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">📤 Total dépenses</p>
            <p className="text-2xl font-bold text-red-600">
              -{caisse.totalDepenses.toLocaleString('fr-FR')} €
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
          <span className="font-bold text-gray-700">Solde de la caisse :</span>
          <span className={`text-2xl font-bold ${caisse.solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {caisse.solde.toLocaleString('fr-FR')} €
          </span>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Projets par statut</h2>
          {statutsData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune donnée</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statutsData} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                  label={({ name, value }) => `${value}`}>
                  {statutsData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Projets par priorité</h2>
          {prioritesData.every(p => p.value === 0) ? (
            <p className="text-gray-500 text-center py-8">Aucune donnée</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={prioritesData.filter(p => p.value > 0)} cx="50%" cy="50%"
                  outerRadius={70} dataKey="value"
                  label={({ name, value }) => `${name} : ${value}`}>
                  <Cell fill="#dc2626" />
                  <Cell fill="#d97706" />
                  <Cell fill="#16a34a" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Budget par type de besoin</h2>
          {besoinsData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune donnée</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={besoinsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `${value.toLocaleString('fr-FR')} €`} />
                <Bar dataKey="budget" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Liste des projets récents */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Projets récents</h2>
        {projets.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun projet pour le moment.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b">
                <th className="pb-3">Titre</th>
                <th className="pb-3">Localité</th>
                <th className="pb-3">Budget</th>
                <th className="pb-3">Priorité</th>
                <th className="pb-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {projets.slice(0, 5).map((projet) => (
                <tr key={projet.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-800">{projet.titre}</td>
                  <td className="py-3 text-gray-600">{projet.village}</td>
                  <td className="py-3 text-gray-600">
                    {parseFloat(projet.budget_estime).toLocaleString('fr-FR')} €
                  </td>
                  <td className="py-3 text-gray-600">{projet.priorite}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(projet.statut)}`}>
                      {projet.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
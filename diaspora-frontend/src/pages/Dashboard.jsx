import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projetService, partenaireService } from '../services/api';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#9333ea', '#dc2626', '#6b7280'];

const Dashboard = () => {
  const { user } = useAuth();
  const [projets, setProjets] = useState([]);
  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projetsRes, partenairesRes] = await Promise.all([
          projetService.getAll(),
          partenaireService.getAll()
        ]);
        setProjets(projetsRes.data.projets);
        setPartenaires(partenairesRes.data.partenaires);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Statistiques
  const totalProjets = projets.length;
  const projetsActifs = projets.filter(p => p.statut === 'En cours de réalisation').length;
  const totalBudget = projets.reduce((sum, p) => sum + parseFloat(p.budget_estime || 0), 0);
  const totalPartenaires = partenaires.length;

  // Données pour graphique statuts
  const statutsData = projets.reduce((acc, projet) => {
    const existing = acc.find(item => item.name === projet.statut);
    if (existing) existing.value++;
    else acc.push({ name: projet.statut, value: 1 });
    return acc;
  }, []);

  // Données pour graphique types de besoins
  const besoinsData = projets.reduce((acc, projet) => {
    const existing = acc.find(item => item.name === projet.type_besoin);
    if (existing) existing.budget += parseFloat(projet.budget_estime || 0);
    else acc.push({ name: projet.type_besoin, budget: parseFloat(projet.budget_estime || 0) });
    return acc;
  }, []);

  // Données pour graphique priorités
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Tableau de bord
      </h1>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Total Projets</p>
          <p className="text-3xl font-bold text-gray-800">{totalProjets}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Projets Actifs</p>
          <p className="text-3xl font-bold text-gray-800">{projetsActifs}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">Budget Total</p>
          <p className="text-3xl font-bold text-gray-800">
            {totalBudget.toLocaleString('fr-FR')} €
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">Partenaires</p>
          <p className="text-3xl font-bold text-gray-800">{totalPartenaires}</p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* Graphique statuts */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Projets par statut</h2>
          {statutsData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune donnée</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statutsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) => `${value}`}
                >
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

        {/* Graphique priorités */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Projets par priorité</h2>
          {prioritesData.every(p => p.value === 0) ? (
            <p className="text-gray-500 text-center py-8">Aucune donnée</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={prioritesData.filter(p => p.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  <Cell fill="#dc2626" />
                  <Cell fill="#d97706" />
                  <Cell fill="#16a34a" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Graphique budgets par type */}
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
                <th className="pb-3">Village</th>
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
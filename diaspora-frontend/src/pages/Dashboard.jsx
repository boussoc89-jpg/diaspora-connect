import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projetService, partenaireService } from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
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

  // Calculs des statistiques
  const totalProjets = projets.length;
  const projetsActifs = projets.filter(p => p.statut === 'En cours de réalisation').length;
  const totalBudget = projets.reduce((sum, p) => sum + parseFloat(p.budget_estime || 0), 0);
  const totalPartenaires = partenaires.length;

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

  const getPrioriteColor = (priorite) => {
    const colors = {
      'haute': 'text-red-600',
      'moyenne': 'text-yellow-600',
      'basse': 'text-green-600'
    };
    return colors[priorite] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Navbar */}
      <nav className="bg-green-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <div className="bg-white text-green-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
            DC
          </div>
          <span className="font-bold text-lg">DiasporaConnect</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">Bonjour, {user?.prenom} {user?.nom}</span>
          <button
            onClick={logout}
            className="bg-white text-green-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-50"
          >
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="p-6">
        
        {/* Titre */}
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

        {/* Liste des projets */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Projets récents
          </h2>
          
          {projets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun projet pour le moment.
            </p>
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
                {projets.map((projet) => (
                  <tr key={projet.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">{projet.titre}</td>
                    <td className="py-3 text-gray-600">{projet.village}</td>
                    <td className="py-3 text-gray-600">
                      {parseFloat(projet.budget_estime).toLocaleString('fr-FR')} €
                    </td>
                    <td className="py-3">
                      <span className={`font-medium ${getPrioriteColor(projet.priorite)}`}>
                        {projet.priorite}
                      </span>
                    </td>
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
    </div>
  );
};

export default Dashboard;
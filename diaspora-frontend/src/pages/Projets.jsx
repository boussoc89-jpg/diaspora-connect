import { useState, useEffect } from 'react';
import { projetService, exportService } from '../services/api';

const Projets = () => {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    titre: '',
    description: '',
    village: '',
    region: '',
    type_besoin: 'eau',
    budget_estime: '',
    nb_beneficiaires: '',
    statut: 'Identifié',
    priorite: 'moyenne',
    objectifs: ''
  });

  useEffect(() => {
    fetchProjets();
  }, []);

  const fetchProjets = async () => {
    try {
      const res = await projetService.getAll();
      setProjets(res.data.projets);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await projetService.create(form);
      setSuccess('Projet créé avec succès !');
      setShowForm(false);
      setForm({
        titre: '', description: '', village: '', region: '',
        type_besoin: 'eau', budget_estime: '', nb_beneficiaires: '',
        statut: 'Identifié', priorite: 'moyenne', objectifs: ''
      });
      fetchProjets();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce projet ?')) {
      try {
        await projetService.delete(id);
        setSuccess('Projet supprimé avec succès !');
        fetchProjets();
      } catch (err) {
        setError('Erreur lors de la suppression.');
      }
    }
  };

  const handleExportPDF = async (id) => {
    try {
      const res = await exportService.exportProjetPDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `projet-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Erreur lors de l export PDF.');
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await exportService.exportProjetsExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'projets.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Erreur lors de l export Excel.');
    }
  };

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Projets</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            📥 Export Excel
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            {showForm ? 'Annuler' : '+ Nouveau Projet'}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{success}</div>}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Nouveau Projet</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input type="text" value={form.titre}
                onChange={(e) => setForm({...form, titre: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
              <input type="text" value={form.village}
                onChange={(e) => setForm({...form, village: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
              <input type="text" value={form.region}
                onChange={(e) => setForm({...form, region: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de besoin</label>
              <select value={form.type_besoin}
                onChange={(e) => setForm({...form, type_besoin: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500">
                <option value="eau">Eau</option>
                <option value="éducation">Éducation</option>
                <option value="santé">Santé</option>
                <option value="agriculture">Agriculture</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget estimé (€)</label>
              <input type="number" value={form.budget_estime}
                onChange={(e) => setForm({...form, budget_estime: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de bénéficiaires</label>
              <input type="number" value={form.nb_beneficiaires}
                onChange={(e) => setForm({...form, nb_beneficiaires: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
              <select value={form.priorite}
                onChange={(e) => setForm({...form, priorite: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500">
                <option value="haute">Haute</option>
                <option value="moyenne">Moyenne</option>
                <option value="basse">Basse</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select value={form.statut}
                onChange={(e) => setForm({...form, statut: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500">
                <option value="Identifié">Identifié</option>
                <option value="En recherche de financement">En recherche de financement</option>
                <option value="Financé">Financé</option>
                <option value="En cours de réalisation">En cours de réalisation</option>
                <option value="Terminé">Terminé</option>
                <option value="Archivé">Archivé</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                rows="3" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Objectifs</label>
              <textarea value={form.objectifs}
                onChange={(e) => setForm({...form, objectifs: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                rows="2" />
            </div>
            <div className="md:col-span-2">
              <button type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                Créer le projet
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Liste des projets ({projets.length})
        </h2>
        {loading ? (
          <p className="text-gray-500 text-center py-8">Chargement...</p>
        ) : projets.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun projet pour le moment.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b">
                <th className="pb-3">Titre</th>
                <th className="pb-3">Village</th>
                <th className="pb-3">Budget</th>
                <th className="pb-3">Bénéficiaires</th>
                <th className="pb-3">Priorité</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3">Actions</th>
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
                  <td className="py-3 text-gray-600">{projet.nb_beneficiaires}</td>
                  <td className="py-3 text-gray-600">{projet.priorite}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(projet.statut)}`}>
                      {projet.statut}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExportPDF(projet.id)}
                        className="text-blue-500 hover:text-blue-700 text-sm">
                        PDF
                      </button>
                      <button
                        onClick={() => handleDelete(projet.id)}
                        className="text-red-500 hover:text-red-700 text-sm">
                        Supprimer
                      </button>
                    </div>
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

export default Projets;
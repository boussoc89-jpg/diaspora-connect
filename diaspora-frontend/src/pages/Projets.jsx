import { useState, useEffect } from 'react';
import { projetService, exportService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Projets = () => {
  const { user } = useAuth();
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProjet, setEditingProjet] = useState(null);
  const [consultingProjet, setConsultingProjet] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [typeBesoinPersonalise, setTypeBesoinPersonalise] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [filtrePriorite, setFiltrePriorite] = useState('');
  const [filtreType, setFiltreType] = useState('');
  const [projetsSelectionnes, setProjetsSelectionnes] = useState([]);
  const [pageCourante, setPageCourante] = useState(1);
  const projetsParPage = 5;
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

  useEffect(() => { fetchProjets(); }, []);

  useEffect(() => {
    setPageCourante(1);
  }, [recherche, filtreStatut, filtrePriorite, filtreType]);

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

  const projetsFiltres = projets.filter(projet => {
    const matchRecherche = projet.titre.toLowerCase().includes(recherche.toLowerCase()) ||
      projet.village.toLowerCase().includes(recherche.toLowerCase()) ||
      projet.region.toLowerCase().includes(recherche.toLowerCase());
    const matchStatut = filtreStatut === '' || projet.statut === filtreStatut;
    const matchPriorite = filtrePriorite === '' || projet.priorite === filtrePriorite;
    const matchType = filtreType === '' || projet.type_besoin === filtreType;
    return matchRecherche && matchStatut && matchPriorite && matchType;
  });

  const totalPages = Math.ceil(projetsFiltres.length / projetsParPage);
  const indexDebut = (pageCourante - 1) * projetsParPage;
  const indexFin = indexDebut + projetsParPage;
  const projetsPagines = projetsFiltres.slice(indexDebut, indexFin);

  const toggleSelection = (id) => {
    setProjetsSelectionnes(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleTout = () => {
    if (projetsSelectionnes.length === projetsFiltres.length) {
      setProjetsSelectionnes([]);
    } else {
      setProjetsSelectionnes(projetsFiltres.map(p => p.id));
    }
  };

  const handleExportExcelSelection = async () => {
    try {
      const ids = projetsSelectionnes.length > 0
        ? projetsSelectionnes
        : projetsFiltres.map(p => p.id);
      const res = await exportService.exportProjetsExcel(ids);
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

  const handleEdit = (projet) => {
    setEditingProjet(projet.id);
    setConsultingProjet(null);
    const typesStandards = ['eau', 'éducation', 'santé', 'agriculture', 'autre'];
    const isPersonalise = !typesStandards.includes(projet.type_besoin);
    setTypeBesoinPersonalise(isPersonalise);
    setForm({
      titre: projet.titre,
      description: projet.description,
      village: projet.village,
      region: projet.region,
      type_besoin: projet.type_besoin,
      budget_estime: projet.budget_estime,
      nb_beneficiaires: projet.nb_beneficiaires,
      statut: projet.statut,
      priorite: projet.priorite,
      objectifs: projet.objectifs || ''
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProjet(null);
    setTypeBesoinPersonalise(false);
    setForm({
      titre: '', description: '', village: '', region: '',
      type_besoin: 'eau', budget_estime: '', nb_beneficiaires: '',
      statut: 'Identifié', priorite: 'moyenne', objectifs: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingProjet) {
        await projetService.update(editingProjet, form);
        setSuccess('Projet modifié avec succès !');
      } else {
        await projetService.create(form);
        setSuccess('Projet créé avec succès !');
      }
      handleCancel();
      fetchProjets();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.');
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
          <button onClick={handleExportExcelSelection}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            📥 {projetsSelectionnes.length > 0 ? `Exporter (${projetsSelectionnes.length})` : 'Export Excel'}
          </button>
          {(user?.role === 'admin' || user?.role === 'membre') && (
            <button onClick={() => { setEditingProjet(null); setShowForm(!showForm); }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              {showForm ? 'Annuler' : '+ Nouveau Projet'}
            </button>
          )}
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{success}</div>}

      {/* Modal Consultation */}
      {consultingProjet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">📋 Détails du projet</h2>
              <button onClick={() => setConsultingProjet(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Titre</p>
                <p className="font-bold text-gray-800 text-lg">{consultingProjet.titre}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Localité</p>
                <p className="font-medium text-gray-800">{consultingProjet.village}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Région</p>
                <p className="font-medium text-gray-800">{consultingProjet.region}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Type de besoin</p>
                <p className="font-medium text-gray-800">{consultingProjet.type_besoin}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Budget estimé</p>
                <p className="font-medium text-gray-800">
                  {parseFloat(consultingProjet.budget_estime).toLocaleString('fr-FR')} €
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Bénéficiaires</p>
                <p className="font-medium text-gray-800">{consultingProjet.nb_beneficiaires}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Priorité</p>
                <p className="font-medium text-gray-800">{consultingProjet.priorite}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Statut</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(consultingProjet.statut)}`}>
                  {consultingProjet.statut}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-gray-800 mt-1">{consultingProjet.description}</p>
              </div>
              {consultingProjet.objectifs && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Objectifs</p>
                  <p className="text-gray-800 mt-1">{consultingProjet.objectifs}</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              {(user?.role === 'admin' || user?.role === 'membre') && (
                <button onClick={() => { setConsultingProjet(null); handleEdit(consultingProjet); }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                  ✏️ Modifier
                </button>
              )}
              <button onClick={() => handleExportPDF(consultingProjet.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                📄 Export PDF
              </button>
              {user?.role === 'admin' && (
                <button onClick={() => { setConsultingProjet(null); handleDelete(consultingProjet.id); }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">
                  🗑️ Supprimer
                </button>
              )}
              <button onClick={() => setConsultingProjet(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 text-sm">
                ✕ Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {editingProjet ? 'Modifier le projet' : 'Nouveau Projet'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input type="text" value={form.titre}
                onChange={(e) => setForm({...form, titre: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localité</label>
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
              <div className="flex gap-2">
                {!typeBesoinPersonalise ? (
                  <select value={form.type_besoin}
                    onChange={(e) => setForm({...form, type_besoin: e.target.value})}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500">
                    <option value="eau">Eau</option>
                    <option value="éducation">Éducation</option>
                    <option value="santé">Santé</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="autre">Autre</option>
                  </select>
                ) : (
                  <input type="text" value={form.type_besoin}
                    onChange={(e) => setForm({...form, type_besoin: e.target.value})}
                    placeholder="Décrivez le type de besoin..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                    required />
                )}
                <button type="button"
                  onClick={() => { setTypeBesoinPersonalise(!typeBesoinPersonalise); setForm({...form, type_besoin: 'eau'}); }}
                  className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 text-sm">
                  {typeBesoinPersonalise ? '📋 Liste' : '✏️ Autre'}
                </button>
              </div>
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
            <div className="md:col-span-2 flex gap-2">
              <button type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                {editingProjet ? 'Modifier' : 'Créer le projet'}
              </button>
              <button type="button" onClick={handleCancel}
                className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <input type="text"
              placeholder="🔍 Rechercher un projet..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 text-sm" />
          </div>
          <div>
            <select value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 text-sm">
              <option value="">Tous les statuts</option>
              <option value="Identifié">Identifié</option>
              <option value="En recherche de financement">En recherche de financement</option>
              <option value="Financé">Financé</option>
              <option value="En cours de réalisation">En cours de réalisation</option>
              <option value="Terminé">Terminé</option>
              <option value="Archivé">Archivé</option>
            </select>
          </div>
          <div>
            <select value={filtrePriorite}
              onChange={(e) => setFiltrePriorite(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 text-sm">
              <option value="">Toutes les priorités</option>
              <option value="haute">Haute</option>
              <option value="moyenne">Moyenne</option>
              <option value="basse">Basse</option>
            </select>
          </div>
          <div>
            <select value={filtreType}
              onChange={(e) => setFiltreType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 text-sm">
              <option value="">Tous les types</option>
              <option value="eau">Eau</option>
              <option value="éducation">Éducation</option>
              <option value="santé">Santé</option>
              <option value="agriculture">Agriculture</option>
              <option value="autre">Autre</option>
            </select>
          </div>
        </div>
        {(recherche || filtreStatut || filtrePriorite || filtreType) && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {projetsFiltres.length} résultat(s) trouvé(s)
            </span>
            <button
              onClick={() => { setRecherche(''); setFiltreStatut(''); setFiltrePriorite(''); setFiltreType(''); }}
              className="text-sm text-red-500 hover:text-red-700">
              ✕ Effacer les filtres
            </button>
          </div>
        )}
      </div>

      {/* Liste des projets */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Liste des projets ({projetsFiltres.length})
        </h2>
        {loading ? (
          <p className="text-gray-500 text-center py-8">Chargement...</p>
        ) : projetsFiltres.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun projet trouvé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b">
                  <th className="pb-3 px-2">
                    <input type="checkbox"
                      checked={projetsSelectionnes.length === projetsFiltres.length && projetsFiltres.length > 0}
                      onChange={toggleTout}
                      className="cursor-pointer" />
                  </th>
                  <th className="pb-3 px-2">Titre</th>
                  <th className="pb-3 px-2">Localité</th>
                  <th className="pb-3 px-2">Budget</th>
                  <th className="pb-3 px-2">Bénéficiaires</th>
                  <th className="pb-3 px-2">Priorité</th>
                  <th className="pb-3 px-2">Statut</th>
                  <th className="pb-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projetsPagines.map((projet) => (
                  <tr key={projet.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <input type="checkbox"
                        checked={projetsSelectionnes.includes(projet.id)}
                        onChange={() => toggleSelection(projet.id)}
                        className="cursor-pointer" />
                    </td>
                    <td className="py-3 px-2 font-medium text-gray-800 max-w-xs truncate">{projet.titre}</td>
                    <td className="py-3 px-2 text-gray-600 whitespace-nowrap">{projet.village}</td>
                    <td className="py-3 px-2 text-gray-600 whitespace-nowrap">
                      {parseFloat(projet.budget_estime).toLocaleString('fr-FR')} €
                    </td>
                    <td className="py-3 px-2 text-gray-600">{projet.nb_beneficiaires}</td>
                    <td className="py-3 px-2 text-gray-600 whitespace-nowrap">{projet.priorite}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatutColor(projet.statut)}`}>
                        {projet.statut}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <button onClick={() => setConsultingProjet(projet)}
                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded-lg text-sm font-medium">
                        👁️ Consulter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Affichage {indexDebut + 1} à {Math.min(indexFin, projetsFiltres.length)} sur {projetsFiltres.length} projets
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPageCourante(p => Math.max(p - 1, 1))}
                    disabled={pageCourante === 1}
                    className="px-3 py-1 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
                    ◀ Précédent
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setPageCourante(page)}
                      className={`px-3 py-1 rounded-lg border text-sm font-medium ${pageCourante === page ? 'bg-green-600 text-white border-green-600' : 'hover:bg-gray-100'}`}>
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setPageCourante(p => Math.min(p + 1, totalPages))}
                    disabled={pageCourante === totalPages}
                    className="px-3 py-1 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
                    Suivant ▶
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projets;
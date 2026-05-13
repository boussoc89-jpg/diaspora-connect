import { useState, useEffect } from 'react';
import { depenseService, projetService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Depenses = () => {
  const { user } = useAuth();
  const [depenses, setDepenses] = useState([]);
  const [projets, setProjets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDepense, setEditingDepense] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recherche, setRecherche] = useState('');
  const [filtreCategorie, setFiltreCategorie] = useState('');
  const [filtreMois, setFiltreMois] = useState('');
  const [filtreAnnee, setFiltreAnnee] = useState('');
  const [pageCourante, setPageCourante] = useState(1);
  const depensesParPage = 10;
  const [form, setForm] = useState({
    titre: '',
    montant: '',
    date_depense: '',
    motif: '',
    projet_id: '',
    categorie: 'Autre'
  });

  const anneesListe = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    setPageCourante(1);
  }, [recherche, filtreCategorie, filtreMois, filtreAnnee]);

  const fetchData = async () => {
    try {
      const [depensesRes, projetsRes, statsRes] = await Promise.all([
        depenseService.getAll(),
        projetService.getAll(),
        depenseService.getStats()
      ]);
      setDepenses(depensesRes.data.depenses);
      setProjets(projetsRes.data.projets);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (depense) => {
    setEditingDepense(depense.id);
    setForm({
      titre: depense.titre,
      montant: depense.montant,
      date_depense: depense.date_depense,
      motif: depense.motif,
      projet_id: depense.projet_id || '',
      categorie: depense.categorie
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDepense(null);
    setForm({
      titre: '', montant: '', date_depense: '',
      motif: '', projet_id: '', categorie: 'Autre'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingDepense) {
        await depenseService.update(editingDepense, form);
        setSuccess('Dépense modifiée avec succès !');
      } else {
        await depenseService.create(form);
        setSuccess('Dépense enregistrée avec succès !');
      }
      handleCancel();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette dépense ?')) {
      try {
        await depenseService.delete(id);
        setSuccess('Dépense supprimée !');
        fetchData();
      } catch (err) {
        setError('Erreur lors de la suppression.');
      }
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ['Titre', 'Montant (€)', 'Date', 'Catégorie', 'Projet lié', 'Motif'],
      ...depensesFiltrees.map(d => [
        d.titre,
        parseFloat(d.montant),
        d.date_depense,
        d.categorie,
        d.projet?.titre || '-',
        d.motif
      ])
    ];
    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'depenses.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const getCategorieColor = (categorie) => {
    const colors = {
      'Projet': 'bg-blue-100 text-blue-700',
      'Fonctionnement': 'bg-purple-100 text-purple-700',
      'Communication': 'bg-yellow-100 text-yellow-700',
      'Transport': 'bg-orange-100 text-orange-700',
      'Autre': 'bg-gray-100 text-gray-700'
    };
    return colors[categorie] || 'bg-gray-100 text-gray-700';
  };

  // Filtrage
  const depensesFiltrees = depenses.filter(d => {
    const matchRecherche = recherche === '' || d.titre.toLowerCase().includes(recherche.toLowerCase());
    const matchCategorie = filtreCategorie === '' || d.categorie === filtreCategorie;
    const matchMois = filtreMois === '' || (d.date_depense && new Date(d.date_depense).getMonth() + 1 === parseInt(filtreMois));
    const matchAnnee = filtreAnnee === '' || (d.date_depense && new Date(d.date_depense).getFullYear() === parseInt(filtreAnnee));
    return matchRecherche && matchCategorie && matchMois && matchAnnee;
  });

  const totalFiltre = depensesFiltrees.reduce((sum, d) => sum + parseFloat(d.montant), 0);

  // Pagination
  const totalPages = Math.ceil(depensesFiltrees.length / depensesParPage);
  const indexDebut = (pageCourante - 1) * depensesParPage;
  const indexFin = indexDebut + depensesParPage;
  const depensesPaginees = depensesFiltrees.slice(indexDebut, indexFin);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📤 Gestion des Dépenses</h1>
        <div className="flex gap-2">
          <button onClick={handleExportCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
            📥 Export CSV
          </button>
          {(user?.role === 'admin' || user?.role === 'membre') && (
            <button onClick={() => { setEditingDepense(null); setShowForm(!showForm); }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              {showForm ? 'Annuler' : '+ Nouvelle Dépense'}
            </button>
          )}
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{success}</div>}

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Total Dépenses</p>
            <p className="text-3xl font-bold text-red-600">
              {stats.total.toLocaleString('fr-FR')} €
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Nombre de dépenses</p>
            <p className="text-3xl font-bold text-gray-800">{depenses.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-orange-500">
            <p className="text-gray-500 text-sm">Dépenses projets</p>
            <p className="text-3xl font-bold text-gray-800">
              {(stats.parCategorie['Projet'] || 0).toLocaleString('fr-FR')} €
            </p>
          </div>
        </div>
      )}

      

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {editingDepense ? 'Modifier la dépense' : 'Nouvelle Dépense'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
              <input type="number" value={form.montant}
                onChange={(e) => setForm({...form, montant: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date_depense}
                onChange={(e) => setForm({...form, date_depense: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select value={form.categorie}
                onChange={(e) => setForm({...form, categorie: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500">
                <option value="Projet">Projet</option>
                <option value="Fonctionnement">Fonctionnement</option>
                <option value="Communication">Communication</option>
                <option value="Transport">Transport</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Projet lié (optionnel)</label>
              <select value={form.projet_id}
                onChange={(e) => setForm({...form, projet_id: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500">
                <option value="">Aucun projet</option>
                {projets.map(p => (
                  <option key={p.id} value={p.id}>{p.titre}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
              <textarea value={form.motif}
                onChange={(e) => setForm({...form, motif: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                rows="3" required />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                {editingDepense ? 'Modifier' : 'Enregistrer'}
              </button>
              <button type="button" onClick={handleCancel}
                className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Répartition par catégorie */}
      {stats && Object.keys(stats.parCategorie).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Répartition par catégorie</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b">
                  <th className="pb-3 px-2">Catégorie</th>
                  <th className="pb-3 px-2">Montant total</th>
                  <th className="pb-3 px-2">Pourcentage</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.parCategorie).map(([cat, montant]) => (
                  <tr key={cat} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategorieColor(cat)}`}>
                        {cat}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-bold text-red-600">
                      {montant.toLocaleString('fr-FR')} €
                    </td>
                    <td className="py-3 px-2 text-gray-600">
                      {stats.total > 0 ? Math.round((montant / stats.total) * 100) : 0} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input type="text"
            placeholder="🔍 Rechercher une dépense..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 text-sm" />
          <select value={filtreCategorie}
            onChange={(e) => setFiltreCategorie(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 text-sm">
            <option value="">Toutes les catégories</option>
            <option value="Projet">Projet</option>
            <option value="Fonctionnement">Fonctionnement</option>
            <option value="Communication">Communication</option>
            <option value="Transport">Transport</option>
            <option value="Autre">Autre</option>
          </select>
          <select value={filtreMois}
            onChange={(e) => setFiltreMois(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 text-sm">
            <option value="">Tous les mois</option>
            <option value="1">Janvier</option>
            <option value="2">Février</option>
            <option value="3">Mars</option>
            <option value="4">Avril</option>
            <option value="5">Mai</option>
            <option value="6">Juin</option>
            <option value="7">Juillet</option>
            <option value="8">Août</option>
            <option value="9">Septembre</option>
            <option value="10">Octobre</option>
            <option value="11">Novembre</option>
            <option value="12">Décembre</option>
          </select>
          <select value={filtreAnnee}
            onChange={(e) => setFiltreAnnee(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 text-sm">
            <option value="">Toutes les années</option>
            {anneesListe.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        {(recherche || filtreCategorie || filtreMois || filtreAnnee) && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {depensesFiltrees.length} résultat(s) — Total : <strong className="text-red-600">{totalFiltre.toLocaleString('fr-FR')} €</strong>
            </span>
            <button onClick={() => { setRecherche(''); setFiltreCategorie(''); setFiltreMois(''); setFiltreAnnee(''); }}
              className="text-sm text-red-500 hover:text-red-700">
              ✕ Effacer les filtres
            </button>
          </div>
        )}
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Liste des dépenses ({depensesFiltrees.length})
        </h2>
        {loading ? (
          <p className="text-gray-500 text-center py-8">Chargement...</p>
        ) : depensesFiltrees.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune dépense trouvée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b">
                  <th className="pb-3 px-2">Titre</th>
                  <th className="pb-3 px-2">Montant</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2">Catégorie</th>
                  <th className="pb-3 px-2">Projet lié</th>
                  <th className="pb-3 px-2">Motif</th>
                  <th className="pb-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {depensesPaginees.map((d) => (
                  <tr key={d.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-gray-800">{d.titre}</td>
                    <td className="py-3 px-2 text-red-600 font-medium whitespace-nowrap">
                      {parseFloat(d.montant).toLocaleString('fr-FR')} €
                    </td>
                    <td className="py-3 px-2 text-gray-600 whitespace-nowrap">{d.date_depense}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategorieColor(d.categorie)}`}>
                        {d.categorie}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-600 whitespace-nowrap">{d.projet?.titre || '-'}</td>
                    <td className="py-3 px-2 text-gray-600 max-w-xs truncate">{d.motif}</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        {(user?.role === 'admin' || user?.role === 'membre') && (
                          <button onClick={() => handleEdit(d)}
                            className="text-green-500 hover:text-green-700 text-sm">✏️</button>
                        )}
                        {user?.role === 'admin' && (
                          <button onClick={() => handleDelete(d.id)}
                            className="text-red-500 hover:text-red-700 text-sm">🗑️</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Affichage {indexDebut + 1} à {Math.min(indexFin, depensesFiltrees.length)} sur {depensesFiltrees.length}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPageCourante(p => Math.max(p - 1, 1))}
                    disabled={pageCourante === 1}
                    className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-100">
                    ◀ Précédent
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setPageCourante(page)}
                      className={`px-3 py-1 rounded-lg border text-sm ${pageCourante === page ? 'bg-green-600 text-white' : 'hover:bg-gray-100'}`}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setPageCourante(p => Math.min(p + 1, totalPages))}
                    disabled={pageCourante === totalPages}
                    className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-100">
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

export default Depenses;
import { useState, useEffect } from 'react';
import { cotisationService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Cotisations = () => {
  const { user } = useAuth();
  const [cotisations, setCotisations] = useState([]);
  const [membres, setMembres] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCotisation, setEditingCotisation] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recherche, setRecherche] = useState('');
  const [filtreMois, setFiltreMois] = useState('');
  const [filtreAnnee, setFiltreAnnee] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [pageCourante, setPageCourante] = useState(1);
  const cotisationsParPage = 10;
  const [form, setForm] = useState({
    user_id: '',
    montant: '',
    date_versement: '',
    mois: '',
    annee: new Date().getFullYear(),
    notes: '',
    statut: 'payé'
  });

  const moisListe = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const anneesListe = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    setPageCourante(1);
  }, [recherche, filtreMois, filtreAnnee, filtreStatut]);

  const fetchData = async () => {
    try {
      const [cotisationsRes, membresRes, statsRes] = await Promise.all([
        cotisationService.getAll(),
        authService.getUsers(),
        cotisationService.getStats()
      ]);
      setCotisations(cotisationsRes.data.cotisations);
      setMembres(membresRes.data.users);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cotisation) => {
    setEditingCotisation(cotisation.id);
    setForm({
      user_id: cotisation.user_id,
      montant: cotisation.montant,
      date_versement: cotisation.date_versement,
      mois: cotisation.mois,
      annee: cotisation.annee,
      notes: cotisation.notes || '',
      statut: cotisation.statut
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCotisation(null);
    setForm({
      user_id: '', montant: '', date_versement: '',
      mois: '', annee: new Date().getFullYear(),
      notes: '', statut: 'payé'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingCotisation) {
        await cotisationService.update(editingCotisation, form);
        setSuccess('Cotisation modifiée avec succès !');
      } else {
        await cotisationService.create(form);
        setSuccess('Cotisation enregistrée avec succès !');
      }
      handleCancel();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette cotisation ?')) {
      try {
        await cotisationService.delete(id);
        setSuccess('Cotisation supprimée !');
        fetchData();
      } catch (err) {
        setError('Erreur lors de la suppression.');
      }
    }
  };

  const handleExportExcel = () => {
    const rows = [
      ['Membre', 'Montant (€)', 'Date', 'Mois', 'Année', 'Statut'],
      ...cotisationsFiltrees.map(c => [
        `${c.membre?.prenom} ${c.membre?.nom}`,
        parseFloat(c.montant),
        c.date_versement,
        c.mois,
        c.annee,
        c.statut
      ])
    ];
    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cotisations.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const getStatutColor = (statut) => {
    const colors = {
      'payé': 'bg-green-100 text-green-700',
      'en attente': 'bg-yellow-100 text-yellow-700',
      'annulé': 'bg-red-100 text-red-700'
    };
    return colors[statut] || 'bg-gray-100 text-gray-700';
  };

  // Filtrage
  const cotisationsFiltrees = cotisations.filter(c => {
    const nomComplet = `${c.membre?.prenom} ${c.membre?.nom}`.toLowerCase();
    const matchRecherche = recherche === '' || nomComplet.includes(recherche.toLowerCase());
    const matchMois = filtreMois === '' || c.mois === filtreMois;
    const matchAnnee = filtreAnnee === '' || c.annee === parseInt(filtreAnnee);
    const matchStatut = filtreStatut === '' || c.statut === filtreStatut;
    return matchRecherche && matchMois && matchAnnee && matchStatut;
  });

  const totalFiltre = cotisationsFiltrees.reduce((sum, c) => sum + parseFloat(c.montant), 0);

  // Pagination
  const totalPages = Math.ceil(cotisationsFiltrees.length / cotisationsParPage);
  const indexDebut = (pageCourante - 1) * cotisationsParPage;
  const indexFin = indexDebut + cotisationsParPage;
  const cotisationsPaginees = cotisationsFiltrees.slice(indexDebut, indexFin);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">💰 Cotisations des Membres</h1>
        <div className="flex gap-2">
          <button onClick={handleExportExcel}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
            📥 Export CSV
          </button>
          {(user?.role === 'admin' || user?.role === 'membre') && (
            <button onClick={() => { setEditingCotisation(null); setShowForm(!showForm); }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              {showForm ? 'Annuler' : '+ Nouvelle Cotisation'}
            </button>
          )}
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{success}</div>}

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Total Cotisations</p>
            <p className="text-3xl font-bold text-green-600">
              {stats.total.toLocaleString('fr-FR')} €
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Nombre de versements</p>
            <p className="text-3xl font-bold text-gray-800">{cotisations.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm">Membres contributeurs</p>
            <p className="text-3xl font-bold text-gray-800">{stats.parMembre.length}</p>
          </div>
        </div>
      )}



      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {editingCotisation ? 'Modifier la cotisation' : 'Nouvelle Cotisation'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Membre</label>
              <select value={form.user_id}
                onChange={(e) => setForm({...form, user_id: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required>
                <option value="">Sélectionner un membre</option>
                {membres.map(m => (
                  <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
              <input type="number" value={form.montant}
                onChange={(e) => setForm({...form, montant: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de versement</label>
              <input type="date" value={form.date_versement}
                onChange={(e) => setForm({...form, date_versement: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mois concerné</label>
              <select value={form.mois}
                onChange={(e) => setForm({...form, mois: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required>
                <option value="">Sélectionner le mois</option>
                {moisListe.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
              <select value={form.annee}
                onChange={(e) => setForm({...form, annee: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500">
                {anneesListe.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select value={form.statut}
                onChange={(e) => setForm({...form, statut: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500">
                <option value="payé">Payé</option>
                <option value="en attente">En attente</option>
                <option value="annulé">Annulé</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={form.notes}
                onChange={(e) => setForm({...form, notes: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                rows="2" />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                {editingCotisation ? 'Modifier' : 'Enregistrer'}
              </button>
              <button type="button" onClick={handleCancel}
                className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
            {/* Résumé par membre */}
      {stats && stats.parMembre.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Résumé par membre</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b">
                  <th className="pb-3 px-2">Membre</th>
                  <th className="pb-3 px-2">Versements</th>
                  <th className="pb-3 px-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.parMembre.map((m, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-gray-800">{m.membre}</td>
                    <td className="py-3 px-2 text-gray-600">{m.nb} versement(s)</td>
                    <td className="py-3 px-2 font-bold text-green-600">
                      {m.total.toLocaleString('fr-FR')} €
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
            placeholder="🔍 Rechercher un membre..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 text-sm" />
          <select value={filtreMois}
            onChange={(e) => setFiltreMois(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 text-sm">
            <option value="">Tous les mois</option>
            {moisListe.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select value={filtreAnnee}
            onChange={(e) => setFiltreAnnee(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 text-sm">
            <option value="">Toutes les années</option>
            {anneesListe.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 text-sm">
            <option value="">Tous les statuts</option>
            <option value="payé">Payé</option>
            <option value="en attente">En attente</option>
            <option value="annulé">Annulé</option>
          </select>
        </div>
        {(recherche || filtreMois || filtreAnnee || filtreStatut) && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {cotisationsFiltrees.length} résultat(s) — Total : <strong>{totalFiltre.toLocaleString('fr-FR')} €</strong>
            </span>
            <button onClick={() => { setRecherche(''); setFiltreMois(''); setFiltreAnnee(''); setFiltreStatut(''); }}
              className="text-sm text-red-500 hover:text-red-700">
              ✕ Effacer les filtres
            </button>
          </div>
        )}
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Liste des cotisations ({cotisationsFiltrees.length})
        </h2>
        {loading ? (
          <p className="text-gray-500 text-center py-8">Chargement...</p>
        ) : cotisationsFiltrees.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune cotisation trouvée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b">
                  <th className="pb-3 px-2">Membre</th>
                  <th className="pb-3 px-2">Montant</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2">Mois</th>
                  <th className="pb-3 px-2">Année</th>
                  <th className="pb-3 px-2">Statut</th>
                  <th className="pb-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cotisationsPaginees.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-gray-800">
                      {c.membre?.prenom} {c.membre?.nom}
                    </td>
                    <td className="py-3 px-2 text-green-600 font-medium">
                      {parseFloat(c.montant).toLocaleString('fr-FR')} €
                    </td>
                    <td className="py-3 px-2 text-gray-600 whitespace-nowrap">{c.date_versement}</td>
                    <td className="py-3 px-2 text-gray-600">{c.mois}</td>
                    <td className="py-3 px-2 text-gray-600">{c.annee}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(c.statut)}`}>
                        {c.statut}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        {(user?.role === 'admin' || user?.role === 'membre') && (
                          <button onClick={() => handleEdit(c)}
                            className="text-green-500 hover:text-green-700 text-sm">✏️</button>
                        )}
                        {user?.role === 'admin' && (
                          <button onClick={() => handleDelete(c.id)}
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
                  Affichage {indexDebut + 1} à {Math.min(indexFin, cotisationsFiltrees.length)} sur {cotisationsFiltrees.length}
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

export default Cotisations;

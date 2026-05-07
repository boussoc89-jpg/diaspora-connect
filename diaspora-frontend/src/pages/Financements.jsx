import { useState, useEffect } from 'react';
import { financementService, projetService, partenaireService } from '../services/api';

const Financements = () => {
  const [financements, setFinancements] = useState([]);
  const [projets, setProjets] = useState([]);
  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedProjet, setSelectedProjet] = useState('');
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({
    projet_id: '',
    partenaire_id: '',
    montant_promis: '',
    montant_verse: '0',
    date_engagement: '',
    date_versement: '',
    reference: '',
    statut: 'Promesse',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

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

  const fetchFinancements = async (projetId) => {
    try {
      const [finRes, statsRes] = await Promise.all([
        financementService.getByProjet(projetId),
        financementService.getStats(projetId)
      ]);
      setFinancements(finRes.data.financements);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleProjetChange = (e) => {
    const projetId = e.target.value;
    setSelectedProjet(projetId);
    if (projetId) fetchFinancements(projetId);
    else {
      setFinancements([]);
      setStats(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await financementService.create(form);
      setSuccess('Financement créé avec succès !');
      setShowForm(false);
      setForm({
        projet_id: '', partenaire_id: '', montant_promis: '',
        montant_verse: '0', date_engagement: '', date_versement: '',
        reference: '', statut: 'Promesse', notes: ''
      });
      if (selectedProjet) fetchFinancements(selectedProjet);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création.');
    }
  };

  const getStatutColor = (statut) => {
    const colors = {
      'Promesse': 'bg-yellow-100 text-yellow-700',
      'Versement partiel': 'bg-blue-100 text-blue-700',
      'Versement total': 'bg-green-100 text-green-700',
      'Annulé': 'bg-red-100 text-red-700'
    };
    return colors[statut] || 'bg-gray-100 text-gray-700';
  };

  const getTauxColor = (taux) => {
    if (taux < 30) return 'bg-red-500';
    if (taux < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Suivi Financier</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          {showForm ? 'Annuler' : '+ Nouveau Financement'}
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{success}</div>}

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Nouveau Financement</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Projet</label>
              <select
                value={form.projet_id}
                onChange={(e) => setForm({...form, projet_id: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required
              >
                <option value="">Sélectionner un projet</option>
                {projets.map(p => (
                  <option key={p.id} value={p.id}>{p.titre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Partenaire</label>
              <select
                value={form.partenaire_id}
                onChange={(e) => setForm({...form, partenaire_id: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required
              >
                <option value="">Sélectionner un partenaire</option>
                {partenaires.map(p => (
                  <option key={p.id} value={p.id}>{p.denomination}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant promis (€)</label>
              <input
                type="number"
                value={form.montant_promis}
                onChange={(e) => setForm({...form, montant_promis: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant versé (€)</label>
              <input
                type="number"
                value={form.montant_verse}
                onChange={(e) => setForm({...form, montant_verse: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'engagement</label>
              <input
                type="date"
                value={form.date_engagement}
                onChange={(e) => setForm({...form, date_engagement: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={form.statut}
                onChange={(e) => setForm({...form, statut: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
              >
                <option value="Promesse">Promesse</option>
                <option value="Versement partiel">Versement partiel</option>
                <option value="Versement total">Versement total</option>
                <option value="Annulé">Annulé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
              <input
                type="text"
                value={form.reference}
                onChange={(e) => setForm({...form, reference: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({...form, notes: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Créer le financement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sélection projet pour voir les financements */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Voir les financements par projet
        </h2>
        <select
          value={selectedProjet}
          onChange={handleProjetChange}
          className="w-full md:w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
        >
          <option value="">Sélectionner un projet</option>
          {projets.map(p => (
            <option key={p.id} value={p.id}>{p.titre}</option>
          ))}
        </select>

        {/* Statistiques */}
        {stats && (
          <div className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Budget estimé</p>
                <p className="font-bold text-gray-800">
                  {parseFloat(stats.budget_estime).toLocaleString('fr-FR')} €
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Total promis</p>
                <p className="font-bold text-yellow-700">
                  {stats.total_promis.toLocaleString('fr-FR')} €
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Total versé</p>
                <p className="font-bold text-green-700">
                  {stats.total_verse.toLocaleString('fr-FR')} €
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Reste à financer</p>
                <p className="font-bold text-red-700">
                  {stats.reste_a_financer.toLocaleString('fr-FR')} €
                </p>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="mt-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Taux de financement</span>
                <span>{stats.taux_financement}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${getTauxColor(stats.taux_financement)}`}
                  style={{ width: `${Math.min(stats.taux_financement, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liste des financements */}
      {selectedProjet && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Financements ({financements.length})
          </h2>
          {financements.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun financement pour ce projet.
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b">
                  <th className="pb-3">Partenaire</th>
                  <th className="pb-3">Montant promis</th>
                  <th className="pb-3">Montant versé</th>
                  <th className="pb-3">Date engagement</th>
                  <th className="pb-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {financements.map((f) => (
                  <tr key={f.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">
                      {f.partenaire?.denomination}
                    </td>
                    <td className="py-3 text-gray-600">
                      {parseFloat(f.montant_promis).toLocaleString('fr-FR')} €
                    </td>
                    <td className="py-3 text-gray-600">
                      {parseFloat(f.montant_verse).toLocaleString('fr-FR')} €
                    </td>
                    <td className="py-3 text-gray-600">{f.date_engagement}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(f.statut)}`}>
                        {f.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Financements;
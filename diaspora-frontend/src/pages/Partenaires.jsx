import { useState, useEffect } from 'react';
import { partenaireService } from '../services/api';

const Partenaires = () => {
  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    denomination: '',
    type_partenaire: 'Fondation',
    contact_nom: '',
    contact_email: '',
    telephone: '',
    adresse: '',
    notes: ''
  });

  useEffect(() => {
    fetchPartenaires();
  }, []);

  const fetchPartenaires = async () => {
    try {
      const res = await partenaireService.getAll();
      setPartenaires(res.data.partenaires);
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
      await partenaireService.create(form);
      setSuccess('Partenaire créé avec succès !');
      setShowForm(false);
      setForm({
        denomination: '', type_partenaire: 'Fondation',
        contact_nom: '', contact_email: '',
        telephone: '', adresse: '', notes: ''
      });
      fetchPartenaires();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce partenaire ?')) {
      try {
        await partenaireService.delete(id);
        setSuccess('Partenaire supprimé avec succès !');
        fetchPartenaires();
      } catch (err) {
        setError('Erreur lors de la suppression.');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Partenaires</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          {showForm ? 'Annuler' : '+ Nouveau Partenaire'}
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{success}</div>}

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Nouveau Partenaire</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dénomination</label>
              <input
                type="text"
                value={form.denomination}
                onChange={(e) => setForm({...form, denomination: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type_partenaire}
                onChange={(e) => setForm({...form, type_partenaire: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
              >
                <option value="Fondation">Fondation</option>
                <option value="Mairie">Mairie</option>
                <option value="Entreprise">Entreprise</option>
                <option value="Collectivité">Collectivité</option>
                <option value="Donateur privé">Donateur privé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du contact</label>
              <input
                type="text"
                value={form.contact_nom}
                onChange={(e) => setForm({...form, contact_nom: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email du contact</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({...form, contact_email: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="text"
                value={form.telephone}
                onChange={(e) => setForm({...form, telephone: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                type="text"
                value={form.adresse}
                onChange={(e) => setForm({...form, adresse: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({...form, notes: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                rows="3"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Créer le partenaire
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des partenaires */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Liste des partenaires ({partenaires.length})
        </h2>
        {loading ? (
          <p className="text-gray-500 text-center py-8">Chargement...</p>
        ) : partenaires.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun partenaire pour le moment.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b">
                <th className="pb-3">Dénomination</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Téléphone</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partenaires.map((partenaire) => (
                <tr key={partenaire.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-800">{partenaire.denomination}</td>
                  <td className="py-3 text-gray-600">{partenaire.type_partenaire}</td>
                  <td className="py-3 text-gray-600">{partenaire.contact_nom}</td>
                  <td className="py-3 text-gray-600">{partenaire.contact_email}</td>
                  <td className="py-3 text-gray-600">{partenaire.telephone}</td>
                  <td className="py-3">
                    <button
                      onClick={() => handleDelete(partenaire.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Supprimer
                    </button>
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

export default Partenaires;
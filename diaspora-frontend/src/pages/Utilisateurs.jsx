import { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Utilisateurs = () => {
  const { user } = useAuth();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'membre'
  });

  useEffect(() => { fetchUtilisateurs(); }, []);

  const fetchUtilisateurs = async () => {
    try {
      const res = await authService.getUsers();
      setUtilisateurs(res.data.users);
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
      await authService.register(form);
      setSuccess('Utilisateur créé avec succès !');
      setShowForm(false);
      setForm({ nom: '', prenom: '', email: '', password: '', role: 'membre' });
      fetchUtilisateurs();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création.');
    }
  };

  const handleToggleActif = async (id, actif) => {
    try {
      await authService.updateUser(id, { actif: !actif });
      setSuccess('Statut mis à jour !');
      fetchUtilisateurs();
    } catch (err) {
      setError('Erreur lors de la mise à jour.');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'admin': 'bg-red-100 text-red-700',
      'membre': 'bg-blue-100 text-blue-700',
      'lecteur': 'bg-gray-100 text-gray-700'
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-xl">
          ⛔ Accès refusé. Cette page est réservée aux administrateurs.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          {showForm ? 'Annuler' : '+ Nouveau Membre'}
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{success}</div>}

      {/* Explication des rôles */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <h3 className="font-bold text-blue-800 mb-2">📋 Rôles et droits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3">
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">Admin</span>
            <p className="text-sm text-gray-600 mt-1">Accès complet : gestion des utilisateurs, création/modification/suppression de tout.</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">Membre</span>
            <p className="text-sm text-gray-600 mt-1">Créer/modifier des projets, partenaires et financements. Pas de suppression.</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">Lecteur</span>
            <p className="text-sm text-gray-600 mt-1">Consultation uniquement. Aucune modification possible.</p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Nouveau Membre</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input type="text" value={form.nom}
                onChange={(e) => setForm({...form, nom: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input type="text" value={form.prenom}
                onChange={(e) => setForm({...form, prenom: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input type="password" value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <select value={form.role}
                onChange={(e) => setForm({...form, role: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500">
                <option value="admin">Administrateur</option>
                <option value="membre">Membre actif</option>
                <option value="lecteur">Lecteur</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                Créer le membre
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Membres du bureau ({utilisateurs.length})
        </h2>
        {loading ? (
          <p className="text-gray-500 text-center py-8">Chargement...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b">
                <th className="pb-3">Nom</th>
                <th className="pb-3">Prénom</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Rôle</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {utilisateurs.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-800">{u.nom}</td>
                  <td className="py-3 text-gray-600">{u.prenom}</td>
                  <td className="py-3 text-gray-600">{u.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.actif ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="py-3">
                    {u.id !== user.id && (
                      <button
                        onClick={() => handleToggleActif(u.id, u.actif)}
                        className={`text-sm ${u.actif ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}`}>
                        {u.actif ? '🔒 Désactiver' : '🔓 Activer'}
                      </button>
                    )}
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

export default Utilisateurs;
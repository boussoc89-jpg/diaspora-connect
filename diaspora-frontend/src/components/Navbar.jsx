import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path
    ? 'bg-green-700 text-white'
    : 'text-green-100 hover:bg-green-700';

  return (
    <nav className="bg-green-600 text-white shadow">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-white text-green-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
            DC
          </div>
          <span className="font-bold text-lg">DAS_connect</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">
            {user?.prenom} {user?.nom}
            <span className="ml-2 bg-green-800 px-2 py-0.5 rounded-full text-xs">
              {user?.role}
            </span>
          </span>
          <button onClick={logout}
            className="bg-white text-green-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-50">
            Déconnexion
          </button>
        </div>
      </div>

      <div className="px-6 pb-2 flex gap-2 flex-wrap">
        <Link to="/dashboard" className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/dashboard')}`}>
          🏠 Tableau de bord
        </Link>
        <Link to="/projets" className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/projets')}`}>
          📋 Projets
        </Link>
        <Link to="/partenaires" className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/partenaires')}`}>
          🤝 Partenaires
        </Link>
        <Link to="/financements" className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/financements')}`}>
          💰 Financements
        </Link>
        <Link to="/cotisations" className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/cotisations')}`}>
          💵 Cotisations
        </Link>
        <Link to="/depenses" className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/depenses')}`}>
          📤 Dépenses
        </Link>
        {user?.role === 'admin' && (
          <Link to="/utilisateurs" className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/utilisateurs')}`}>
            👥 Utilisateurs
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

import { Link, useNavigate } from 'react-router-dom';
import { Leaf, LayoutDashboard, History, LogOut, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition">
            <Leaf className="text-green-400 w-4 h-4" />
          </div>
          <span className="font-bold text-white hidden sm:block">Green Code</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition text-sm">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/history" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition text-sm">
            <History className="w-4 h-4" /> History
          </Link>
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <User className="w-4 h-4" />
            <span className="hidden sm:block">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-400 transition rounded-lg hover:bg-gray-800">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}

import { Home, Map, FileCheck, List, GalleryThumbnails, Tag, LogOut, ScrollText } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from 'js-cookie';

export const getUserName = () => {
  const token = localStorage.getItem("wallet");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
    return payload.name; // Extract the 'name' field
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};


const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.replace(/\/$/, "") === path;

  const handleLogout = () => {
    localStorage.clear();
    localStorage.setItem("loggedOut", "1");
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-morphism z-40">
      <div className="flex flex-col h-full p-4">
        {/* Logo */}
        <div className="pl-4 flex items-center gap-2 mb-8 mt-4">
          <span className="font-heading text-2xl font-bold text-white">EnNilam</span>
        </div>

        {/* Main Menu */}
        <nav className="flex flex-col h-full">
          <div className="space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-colors ${
                isActive('/dashboard') 
                  ? 'bg-neon-purple text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home size={18} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => navigate('/myLands')}
              className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-colors ${
                isActive('/myLands') 
                  ? 'bg-neon-purple text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Map size={18} />
              <span>My Lands</span>
            </button>

            <button
              onClick={() => navigate('/verifyLand')}
              className={`flex items-center gap-3 w-full px-4 py-2  rounded-lg transition-colors ${
                isActive('/verifyLand') 
                  ? 'bg-neon-purple text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileCheck size={18} />
              <span>Verify Land</span>
            </button>

            {/* Separator with increased margin */}
            <div className="my-6 border-t border-white/10 pb-2" />

            {/* Marketplace Section */}
            <div className="px-4 py-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase">Marketplace</h3>
            </div>

            <button
              onClick={() => navigate('/marketplace')}
              className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-colors ${
                isActive('/marketplace') && !location.search 
                  ? 'bg-neon-purple text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <List size={18} />
              <span>View Listings</span>
            </button>

            <button
              onClick={() => navigate('/marketplace?tab=auction')}
              className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-colors ${
                location.search === '?tab=auction' 
                  ? 'bg-neon-purple text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <GalleryThumbnails size={18} />
              <span>View Auctions</span>
            </button>

            <button
              onClick={() => navigate('/sellLand')}
              className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-colors ${
                isActive('/sellLand') 
                  ? 'bg-neon-purple text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tag size={18} />
              <span>Sell Land</span>
            </button>

            <button
              onClick={() => navigate('/yourListings')}
              className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-colors ${
                isActive('/yourListings') 
                  ? 'bg-neon-purple text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ScrollText size={18} />
              <span>Your Listings</span>
            </button>
          </div>

          {/* Logout button at bottom */}
          <div className="mt-auto pt-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

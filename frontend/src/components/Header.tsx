
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Only show header in /land routes
  if (!location.pathname.includes('/marketplace/land/')) {
    return null;
  }

  return (
    <header className="fixed top-0 left-64 right-0 h-20 glass-morphism z-30">
      <div className="flex items-center h-full px-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

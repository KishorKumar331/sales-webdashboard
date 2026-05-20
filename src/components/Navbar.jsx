import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Plus, Bell } from 'lucide-react';

const Navbar = ({
  title,
  subtitle,
  showSearch = true,
  showNotifications = true,
  showBack = false,
  onBackPress,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="relative z-50">
      {/* Subtle shadow for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-b-3xl shadow-2xl"></div>
      
      {/* Main navbar content */}
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-b-3xl px-4 pt-4 pb-5">
        {/* Top action bar */}
        <div className="flex items-center justify-between mb-4">
          {/* Search bar or back button */}
          {showSearch && !showBack && (
            <div id="navbar-filter-portal" className="relative flex-1 mr-4 z-[60]">
            </div>
          )}

          {showBack && (
            <button 
              onClick={onBackPress}
              className="
                group bg-white/20 backdrop-blur-sm rounded-full p-3 
                hover:bg-white/30 active:scale-95 transition-all duration-200
                mr-4 shadow-md hover:shadow-lg
              "
            >
              <ArrowLeft className="text-white group-hover:scale-110 transition-transform duration-200" size={24} />
            </button>
          )}

          {!showSearch && !showBack && <div className="flex-1" />}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Add new lead button */}
            <button 
              onClick={() => navigate('/new-lead')}
              className="
                group bg-white/20 backdrop-blur-sm rounded-full p-3 
                hover:bg-white/30 hover:scale-105 active:scale-95
                transition-all duration-200 shadow-md hover:shadow-lg
                relative overflow-hidden
              "
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <Plus className="text-white relative z-10 group-hover:rotate-90 transition-transform duration-300" size={24} />
            </button>

            {/* Notifications button */}
            {showNotifications && (
              <button 
                onClick={handleLogout}
                className="
                  group bg-white/20 backdrop-blur-sm rounded-full p-3 
                  hover:bg-white/30 hover:scale-105 active:scale-95
                  transition-all duration-200 shadow-md hover:shadow-lg
                  relative
                "
              >
                <Bell className="text-white group-hover:animate-pulse transition-all duration-200" size={24} />
                
                {/* Notification badge */}
                <span className="
                  absolute -top-1 -right-1 bg-red-500 text-white rounded-full
                  w-5 h-5 flex items-center justify-center text-xs font-bold
                  shadow-lg animate-pulse ring-2 ring-white/30
                ">
                  3
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Title and subtitle section */}
        {(title || subtitle) && (
          <div className="space-y-1">
            {title && (
              <h1 className="
                text-white text-2xl font-bold tracking-tight
                drop-shadow-sm animate-fade-in
              ">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="
                text-white/80 text-sm font-medium
                drop-shadow-sm animate-fade-in-delay
              ">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-delay {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in-delay 0.5s ease-out 0.1s both;
        }
      `}</style>
    </div>
  );
};

export default Navbar;

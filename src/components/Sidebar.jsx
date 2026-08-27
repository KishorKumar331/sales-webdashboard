import { NavLink } from 'react-router-dom';
import { Home, FilePlus, Clock, CheckCircle, Search, User, Users, TrendingUp, Sparkles, Zap, Download } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();
  const userRole = user?.user?.role;
  const isAdmin = userRole === 'admin';

  const navItems = [
    { to: "/", icon: <Home className="w-5 h-5" />, label: "Create Quote", badge: null },
    { to: "/follow-up", icon: <Clock className="w-5 h-5" />, label: "Follow Up", badge: null },
    { to: "/converted", icon: <CheckCircle className="w-5 h-5" />, label: "Converted", badge: null },
    ...(isAdmin ? [{ to: "/teams", icon: <Users className="w-5 h-5" />, label: "Teams", badge: null }] : []),
    { to: "/accounting", icon: <Users className="w-5 h-5" />, label: "Accounting", badge: null },
    { to: "/profile", icon: <User className="w-5 h-5" />, label: "Profile", badge: null },
  ];

  const handleDirectDownload = (e) => {
    if (e) e.preventDefault();
    window.location.href = "/api/download-app";
  };

  return (
    <div className="relative w-64 h-full flex-shrink-0 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        {/* Animated particles effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-8 w-1 h-1 bg-white rounded-full animate-ping"></div>
          <div className="absolute bottom-20 left-6 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 right-12 w-1 h-1 bg-white rounded-full animate-ping"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative h-full flex flex-col">
        {/* Logo/Brand Section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-white font-bold text-xl tracking-tight flex items-center gap-2">
                Quick Quotes
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              </h1>
              <p className="text-white/60 text-xs font-medium">Pro Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item, index) => (
              <li key={item.to} className="group">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 ease-out transform overflow-hidden
                    ${isActive
                      ? 'bg-gradient-to-r from-white/25 to-white/15 text-white shadow-lg scale-[1.02] backdrop-blur-sm border border-white/20'
                      : 'text-white/80 hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 hover:text-white hover:scale-[1.01] hover:shadow-md'
                    }`
                  }
                  style={{
                    animationDelay: `${index * 60}ms`
                  }}
                >
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                  </div>

                  {/* Active indicator with glow */}
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-white to-white/60 rounded-r-full shadow-lg transition-all duration-300 ${({ isActive }) => isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50'
                    }`}></div>

                  {/* Icon container with enhanced effects */}
                  <div className="mr-3 relative">
                    <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${({ isActive }) => isActive
                      ? 'bg-gradient-to-r from-white/30 to-white/20 blur-md scale-125'
                      : 'bg-white/10 blur-sm group-hover:scale-125 group-hover:bg-white/25'
                      }`}></div>
                    <div className="relative transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                      {item.icon}
                    </div>
                  </div>

                  {/* Label with badge */}
                  <div className="flex-1 flex items-center justify-between">
                    <span className="font-medium transition-all duration-300 group-hover:translate-x-1">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-2 py-0.5 text-xs font-bold text-white shadow-lg animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Ripple effect on hover */}
                  <div className="absolute inset-0 rounded-xl bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-500 ease-out opacity-0 group-hover:opacity-100"></div>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Coming Soon Section */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="relative group">
              <div className="flex items-center px-4 py-3.5 rounded-xl text-white/60 cursor-not-allowed opacity-75 transition-all duration-300 hover:opacity-90">
                <div className="mr-3 relative">
                  <div className="absolute inset-0 bg-white/10 rounded-lg blur-sm animate-pulse"></div>
                  <div className="relative transition-transform duration-300 group-hover:scale-110">
                    <Search className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="font-medium text-sm">Investigation</span>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-yellow-300 animate-pulse" />
                    <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 rounded-full font-bold text-white shadow-lg">
                      Soon
                    </span>
                  </div>
                </div>
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          {/* Mobile App Download Banner */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              onClick={handleDirectDownload}
              className="relative w-full group flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 text-white shadow-xl border border-slate-700/80 hover:border-emerald-500/80 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden text-left"
            >
              {/* Animated Shine Highlight */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <div className="flex items-center gap-3 relative z-10">
                {/* Play Store Logo SVG */}
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 transform group-hover:scale-110 transition-transform" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M325.8 243.7L80.2 4.4C74.6-1.1 66.7-1.5 60.7 1.8L325.8 243.7z" fill="url(#sidebar_play_blue)" />
                    <path d="M418.1 228.6l-92.3-54.9L262.1 237.4l63.7 63.7 92.3-54.9c13.7-8.1 13.7-22.5 0-30.6z" fill="url(#sidebar_play_yellow)" />
                    <path d="M60.7 510.2c6 3.3 13.9 2.9 19.5-2.6l245.6-239.3L60.7 510.2z" fill="url(#sidebar_play_red)" />
                    <path d="M60.7 1.8C54.4 5.3 50.3 12.3 50.3 20.6v470.8c0 8.3 4.1 15.3 10.4 18.8l214.5-253.2L60.7 1.8z" fill="url(#sidebar_play_green)" />
                    <defs>
                      <linearGradient id="sidebar_play_blue" x1="50" y1="250" x2="330" y2="250" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00A0FF" />
                        <stop offset="1" stopColor="#00C8FF" />
                      </linearGradient>
                      <linearGradient id="sidebar_play_yellow" x1="260" y1="250" x2="430" y2="250" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFC107" />
                        <stop offset="1" stopColor="#FF8F00" />
                      </linearGradient>
                      <linearGradient id="sidebar_play_red" x1="50" y1="250" x2="330" y2="250" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FF3D00" />
                        <stop offset="1" stopColor="#DD2C00" />
                      </linearGradient>
                      <linearGradient id="sidebar_play_green" x1="50" y1="20" x2="270" y2="250" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00E676" />
                        <stop offset="1" stopColor="#00B0FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Text Content */}
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase tracking-widest font-semibold text-slate-400 leading-none">DOWNLOAD APP</span>
                  <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight mt-0.5">Get Android APK</span>
                </div>
              </div>

              <Download className="w-4 h-4 text-emerald-400 animate-bounce flex-shrink-0 relative z-10" />
            </button>
          </div>
        </nav>

        {/* Bottom section - Enhanced user info */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-white/25 to-white/10 rounded-full flex items-center justify-center border-2 border-white/20">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white/20 animate-pulse"></div>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold truncate max-w-[130px]" title={user?.FullName || user?.user?.FullName}>
                  {user?.user?.fullname}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-white/60 text-xs">{isAdmin ? 'Admin' : 'Pro'}</p>
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-400 to-emerald-400 px-2 py-0.5 text-xs font-bold text-white">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced animations */}
      <style jsx>{`
        @keyframes slide-in {
          from { 
            opacity: 0; 
            transform: translateX(-30px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        nav li {
          animation: slide-in 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;

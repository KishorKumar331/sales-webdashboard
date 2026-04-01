import { NavLink } from 'react-router-dom';
import { Home, FilePlus, Clock, CheckCircle, Search, User, Users, TrendingUp, Sparkles, Zap } from 'lucide-react';
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

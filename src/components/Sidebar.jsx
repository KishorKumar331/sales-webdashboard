import { NavLink } from 'react-router-dom';
import { Home, FilePlus, Clock, CheckCircle, Search, User, Users, TrendingUp } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: "/", icon: <Home className="w-5 h-5" />, label: "Dashboard" },
    { to: "/create-quote", icon: <FilePlus className="w-5 h-5" />, label: "Create Quote" },
    { to: "/follow-up", icon: <Clock className="w-5 h-5" />, label: "Follow Up" },
    { to: "/converted", icon: <CheckCircle className="w-5 h-5" />, label: "Converted" },
    { to: "/investigation", icon: <Search className="w-5 h-5" />, label: "Investigation" },
    { to: "/teams", icon: <Users className="w-5 h-5" />, label: "Teams" },
    { to: "/profile", icon: <User className="w-5 h-5" />, label: "Profile" },
  ];

  return (
    <div className="relative w-64 h-full flex-shrink-0 overflow-hidden">
      {/* Background gradient with shadow */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-600 via-purple-700 to-indigo-800 shadow-2xl"></div>
      
      {/* Main content */}
      <div className="relative h-full flex flex-col">
        {/* Logo/Brand Section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">SalesHub</h1>
              <p className="text-white/60 text-xs font-medium">Dashboard Pro</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item, index) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `
                    group relative flex items-center px-4 py-3 rounded-xl 
                    transition-all duration-300 ease-out transform
                    ${isActive
                      ? 'bg-white/25 text-white shadow-lg scale-[1.02] backdrop-blur-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white hover:scale-[1.01] hover:shadow-md'
                    }
                    `
                  }
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {/* Active indicator line */}
                  <div className={`
                    absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full
                    transition-all duration-300 ease-out
                    ${({ isActive }) => isActive ? 'opacity-100' : 'opacity-0'}
                  `}></div>
                  
                  {/* Icon container */}
                  <div className="mr-3 relative">
                    <div className={`
                      absolute inset-0 bg-white/20 rounded-lg blur-sm transition-all duration-300
                      group-hover:scale-110 group-hover:bg-white/30
                    `}></div>
                    <div className="relative transition-transform duration-300 group-hover:scale-110">
                      {item.icon}
                    </div>
                  </div>
                  
                  {/* Label */}
                  <span className="font-medium transition-all duration-300 group-hover:translate-x-1">
                    {item.label}
                  </span>

                  {/* Hover effect overlay */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent
                    rounded-xl transition-all duration-500 -translate-x-full
                    group-hover:translate-x-full
                  `}></div>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom section - could add user info or logout */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Admin User</p>
                <p className="text-white/60 text-xs">Premium Plan</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes slide-in {
          from { 
            opacity: 0; 
            transform: translateX(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        nav li {
          animation: slide-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;

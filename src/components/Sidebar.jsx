import { NavLink } from 'react-router-dom';
import { Home, FilePlus, Clock, CheckCircle, Search, User } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: "/", icon: <Home className="w-5 h-5" />, label: "Dashboard" },
    { to: "/create-quote", icon: <FilePlus className="w-5 h-5" />, label: "Create Quote" },
    { to: "/follow-up", icon: <Clock className="w-5 h-5" />, label: "Follow Up" },
    { to: "/converted", icon: <CheckCircle className="w-5 h-5" />, label: "Converted" },
    { to: "/investigation", icon: <Search className="w-5 h-5" />, label: "Investigation" },
    { to: "/profile", icon: <User className="w-5 h-5" />, label: "Profile" },
  ];

  return (
    <div style={{background:'linear-gradient(135deg, rgb(124, 58, 237) 0%, rgba(90, 33, 182, 0.65) 100%)'}} className="w-64 h-full bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
     
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/30 text-white font-medium'
                      : 'text-white/90 hover:bg-black/20 hover:text-white'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

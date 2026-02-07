import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import {
  HiOutlineHome,
  HiOutlinePlusCircle,
  HiOutlineDocumentText,
  HiOutlineTag,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineX,
  HiOutlineMenuAlt2,
} from 'react-icons/hi';

const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(collapsed || false);

  // Sync with parent's collapsed state if provided
  useEffect(() => {
    if (collapsed !== undefined) {
      setIsCollapsed(collapsed);
    }
  }, [collapsed]);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { path: '/expenses/new', label: 'Add Expense', icon: HiOutlinePlusCircle },
    { path: '/expenses', label: 'All Expenses', icon: HiOutlineDocumentText },
    { path: '/categories', label: 'Categories', icon: HiOutlineTag },
    { path: '/budgets', label: 'Budget', icon: HiOutlineCurrencyDollar },
    { path: '/reports', label: 'Reports', icon: HiOutlineChartBar },
    { path: '/settings', label: 'Settings', icon: HiOutlineCog },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (onToggleCollapse) {
      onToggleCollapse(newCollapsed);
    }
  };

  const isActive = (path) => {
    if (path === '/expenses/new') {
      return location.pathname === path;
    }
    if (path === '/expenses') {
      return location.pathname === path || (location.pathname.startsWith('/expenses/') && !location.pathname.includes('/new'));
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full ${sidebarWidth} bg-gradient-to-b from-slate-900 to-slate-800 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-5 border-b border-slate-700/50`}>
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <HiOutlineCurrencyDollar className="w-6 h-6 text-white" />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold text-white tracking-tight">
                  Expense<span className="text-indigo-400">Tracker</span>
                </span>
              )}
            </Link>
            
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          {/* Collapse Toggle (Desktop only) */}
          <button
            onClick={handleToggleCollapse}
            className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-slate-700 hover:bg-indigo-600 text-white rounded-full items-center justify-center shadow-lg transition-colors z-10"
          >
            {isCollapsed ? (
              <HiOutlineChevronRight className="w-4 h-4" />
            ) : (
              <HiOutlineChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative ${
                    active
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                  
                  {/* Active indicator */}
                  {active && !isCollapsed && (
                    <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                      {item.label}
                      <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Upgrade Card (Only when expanded) */}
          {!isCollapsed && (
            <div className="mx-3 mb-4 p-4 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-xl border border-indigo-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Pro Features</p>
                  <p className="text-xs text-slate-400">Unlock advanced analytics</p>
                </div>
              </div>
              <button className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
                Upgrade Now
              </button>
            </div>
          )}

          {/* User Section */}
          <div className="border-t border-slate-700/50 p-3">
            <div className={`flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {getInitials(user?.name)}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800" />
              </div>
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-3 mt-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 group ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? 'Logout' : ''}
            >
              <HiOutlineLogout className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-red-400 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                  Logout
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  // Define navigation items for admin dashboard
  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Students', path: '/admin/students' },
    { name: 'Website Settings', path: '/admin/settings' },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-gray-800 h-screen">
      <div className="h-16 flex items-center justify-center bg-gray-900">
        <h1 className="text-white font-bold text-xl">Admin Panel</h1>
      </div>
      
      {/* Admin info */}
      {currentUser && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
              {currentUser.displayName ? currentUser.displayName.charAt(0) : currentUser.email.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-white text-sm font-medium truncate">
                {currentUser.displayName || currentUser.email}
              </p>
              <p className="text-gray-400 text-xs">
                Admin
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation Menu */}
      <nav className="mt-5 px-2 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {/* Logout button at bottom */}
      <div className="p-4 border-t border-gray-700">
        <Link
          to="/"
          className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          Back to Website
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
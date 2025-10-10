import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MobileSidebar = ({ isOpen, toggleSidebar }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  // Define navigation items for admin dashboard
  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Students', path: '/admin/students' },
    { name: 'Website Settings', path: '/admin/settings' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75"
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>
      
      {/* Sidebar */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 flex items-center px-4">
            <h1 className="text-white font-bold text-xl">Admin Panel</h1>
          </div>
          
          {/* Admin info */}
          {currentUser && (
            <div className="px-4 py-4 border-b border-gray-700">
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
          <nav className="mt-5 px-2">
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
                  onClick={toggleSidebar}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Back to website */}
        <div className="p-4 border-t border-gray-700">
          <Link
            to="/"
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
            onClick={toggleSidebar}
          >
            Back to Website
          </Link>
        </div>
      </div>
      
      <div className="flex-shrink-0 w-14" aria-hidden="true">
        {/* Dummy element to force sidebar to shrink to fit close icon */}
      </div>
    </div>
  );
};

export default MobileSidebar;
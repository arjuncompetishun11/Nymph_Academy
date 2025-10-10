import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AdminHeader = ({ toggleSidebar }) => {
  const { currentUser, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="bg-white border-b flex justify-between items-center h-16 px-6">
      {/* Mobile menu button */}
      <button 
        className="md:hidden text-gray-500 hover:text-gray-600"
        onClick={toggleSidebar}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <div className="md:hidden">
        <h1 className="text-gray-800 font-bold">Admin Panel</h1>
      </div>
      
      {/* Admin profile dropdown */}
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            {currentUser?.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <span className="text-gray-700 font-semibold">
                {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'A'}
              </span>
            )}
          </div>
          <span className="hidden md:inline text-gray-700">
            {currentUser?.displayName || currentUser?.email || 'Admin'}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
            <a href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              View Website
            </a>
            <button
              onClick={signOut}
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavBar = () => {
  const { currentUser, isAdmin, signOut } = useAuth();
  
  return (
    <header className="bg-blue-500 text-white py-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between px-4">
        <div className="flex items-center">
          <img
            src="https://res.cloudinary.com/dzwjnirr2/image/upload/v1760100212/nymph_academy_logo_rpafjh.png"
            alt="Nymph Academy Logo"
            className="h-8 mr-2"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
            }}
          />
          <Link to="/" className="text-xl font-bold">
            Nymph Academy
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          {/* Public Navigation */}
          <Link to="/enrollment" className="hover:text-blue-200 transition">
            Enrollment
          </Link>
          
          {/* Admin Navigation - Only show if user is authenticated and is an admin */}
          {currentUser && isAdmin && (
            <Link to="/admin" className="hover:text-blue-200 transition">
              Admin Dashboard
            </Link>
          )}
          
          {/* Authentication */}
          {!currentUser ? (
            <Link to="/login" className="bg-white text-blue-500 hover:bg-blue-100 px-4 py-1 rounded transition">
              Admin Login
            </Link>
          ) : (
            <div className="relative group">
              <button className="flex items-center hover:text-blue-200 transition">
                <span className="mr-1">
                  {currentUser.displayName?.split(' ')[0] || 'Account'}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                {isAdmin && (
                  <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Admin Dashboard
                  </Link>
                )}
                <button 
                  onClick={signOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <button className="md:hidden text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default NavBar;
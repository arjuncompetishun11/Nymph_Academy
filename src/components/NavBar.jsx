import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavBar = () => {
  const { currentUser, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-blue-500 text-white py-4 relative  z-30">
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
        <button 
          className="md:hidden text-white p-1 rounded-md hover:bg-blue-600 transition" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
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
          )}
        </button>
        
        {/* Mobile Menu */}
        <div 
          className={`md:hidden fixed top-[60px] left-0 right-0 bg-blue-600 z-20 shadow-lg transition-all duration-300 ease-in-out ${
            mobileMenuOpen 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4 divide-y divide-blue-500">
            <div className="pt-2">
              <Link 
                to="/"
                className="block text-white hover:text-blue-200 transition py-2 border-b border-blue-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/enrollment" 
                className="block text-white hover:text-blue-200 transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Enrollment
              </Link>
            </div>
            
            {/* Authentication Section */}
            <div className="pt-3">
              {!currentUser ? (
                <Link 
                  to="/login" 
                  className="inline-block bg-white text-blue-500 hover:bg-blue-100 px-4 py-2 rounded-md transition w-full text-center font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Login
                </Link>
              ) : (
                <div className="flex flex-col space-y-2">
                  <div className="text-white font-medium pb-2 border-b border-blue-500">
                    Signed in as {currentUser.displayName || 'Account'}
                  </div>
                  
                  {/* Admin Navigation - Only show if user is authenticated and is an admin */}
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="text-white hover:text-blue-200 transition py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <button 
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="text-white hover:text-blue-200 transition py-2 text-left flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
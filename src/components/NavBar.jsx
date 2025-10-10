import { Link } from 'react-router-dom';

const NavBar = () => {
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
          {/* <Link to="/" className="hover:text-blue-200 transition">Home</Link> */}
          <Link to="/enrollment" className="hover:text-blue-200 transition">
            Enrollment
          </Link>
          {/* <Link to="/about" className="hover:text-blue-200 transition">About Us</Link>
          <Link to="/courses" className="hover:text-blue-200 transition">Courses</Link>
          <Link to="/contact" className="hover:text-blue-200 transition">Contact</Link> */}
        </nav>
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
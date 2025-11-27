import { Link, useLocation } from 'react-router-dom';
import { Home, FolderOpen } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-16">
        {/* Left side - aligned with "works" column */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link 
            to="/" 
            className="text-xl font-normal text-gray-900 hover:text-primary-600 transition-colors title-font"
          >
            rana elnemr
          </Link>
          
          {!isAdmin && (
            <div className="flex items-center space-x-6 lg:hidden">
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                info
              </Link>
            </div>
          )}
        </div>

        {/* Right side - aligned with "parallel discourse" column */}
        <div className="hidden lg:flex items-center justify-end px-4 sm:px-6 lg:px-8">
          {!isAdmin ? (
            <>
              {/* Info Link */}
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                info
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/admin"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/admin'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FolderOpen size={16} />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/admin/projects/new"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/admin/projects/new'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>New Project</span>
              </Link>
              <Link
                to="/admin/about/edit"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/admin/about/edit'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>Edit About</span>
              </Link>
              <Link
                to="/"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <Home size={16} />
                <span>View Site</span>
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('adminAuthenticated');
                  window.location.href = '/';
                }}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-900 hover:bg-red-50 transition-colors"
              >
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
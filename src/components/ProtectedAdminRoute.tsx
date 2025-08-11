import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('adminAuthenticated');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  const handleLogin = (success: boolean) => {
    setIsAuthenticated(success);
  };

  // const handleLogout = () => {
  //   localStorage.removeItem('adminAuthenticated');
  //   setIsAuthenticated(false);
  // };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  // Show admin content if authenticated
  return (
    <div>
      {children}
    </div>
  );
};

export default ProtectedAdminRoute;
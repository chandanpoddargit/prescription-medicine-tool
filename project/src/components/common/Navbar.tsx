import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Menu, X, User, Pill, Stethoscope } from 'lucide-react';

interface NavbarProps {
  title: string;
}

const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const getRoleIcon = () => {
    switch (user?.role) {
      case 'doctor':
        return <Stethoscope className="h-5 w-5 text-primary-600" />;
      case 'patient':
        return <User className="h-5 w-5 text-accent-600" />;
      case 'pharmacist':
        return <Pill className="h-5 w-5 text-secondary-600" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };
  
  const getDashboardLink = () => {
    switch (user?.role) {
      case 'doctor':
        return '/doctor';
      case 'patient':
        return '/patient';
      case 'pharmacist':
        return '/pharmacist';
      default:
        return '/';
    }
  };
  
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={getDashboardLink()} className="flex-shrink-0 flex items-center">
            <img 
                src="/logo.png" 
                alt="MediTrack Logo" 
                className="h-8 w-auto mr-2"
              />
              <span className="ml-2 text-xl font-serif font-semibold text-gray-800">MediTrack</span>
            </Link>
            <h1 className="ml-6 pl-6 border-l text-lg font-medium text-gray-700">{title}</h1>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getRoleIcon()}
              <span className="text-sm font-medium text-gray-700">
                {user?.name} ({user?.role})
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="btn btn-outline flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {isMenuOpen ? 
                <X className="h-6 w-6" /> : 
                <Menu className="h-6 w-6" />
              }
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="flex items-center space-x-2 px-3 py-2">
              {getRoleIcon()}
              <span className="text-sm font-medium text-gray-700">
                {user?.name} ({user?.role})
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 flex items-center space-x-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import SearchModal from './SearchModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children }) => (
    <Link 
        to={to} 
        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
            isActive(to) 
            ? 'border-indigo-500 text-gray-900' 
            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
        }`}
    >
        {children}
    </Link>
  );

  return (
    <>
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-indigo-600 tracking-tight">PlanningSync</h1>
            </div>
            {user && (
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {user.role === 'ADMIN' ? (
                        <>
                            <NavLink to="/admin">Stats</NavLink>
                            <NavLink to="/admin/manage">Manage</NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink to="/">Dashboard</NavLink>
                            <NavLink to="/events">Events</NavLink>
                            <NavLink to="/habits">Habits</NavLink>
                            
                        </>
                    )}
                    <NavLink to="/settings">Settings</NavLink>
                </div>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center ml-4">
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    title="Global Search"
                  >
                    <span className="sr-only">Search</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
                <span className="text-sm text-gray-700">Hello, {user.username}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="!p-1 rounded-full">
                    <span className="sr-only">Logout</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </Button>
              </div>
            ) : (
              <Link to="/login">
                  <Button variant="primary" size="sm">Log in</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
    <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;

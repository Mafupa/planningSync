import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'USER',
    village: null 
  });
  const [locations, setLocations] = useState([]);
  const [selectedVillageId, setSelectedVillageId] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch locations to populate village dropdown
    const fetchLocations = async () => {
      try {
        const res = await fetch('/api/location/all');
        if (res.ok) {
          const data = await res.json();
          // Filter for type 'VILLAGE'
          const villages = data.filter(loc => loc.type === 'VILLAGE');
          setLocations(villages);
        }
      } catch (err) {
        console.error("Failed to fetch locations", err);
      }
    };
    fetchLocations();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVillageChange = (e) => {
    const id = e.target.value;
    setSelectedVillageId(id);
    const villageObj = locations.find(loc => loc.id === id);
    setFormData({ ...formData, village: villageObj || null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.village) {
        setError('Please select a village');
        return;
    }

    try {
      await signup(formData);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join PlanningSync today
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
               <label htmlFor="village" className="block text-sm font-medium text-gray-700">
                 Village
               </label>
               <select
                 id="village"
                 name="village"
                 required
                 value={selectedVillageId}
                 onChange={handleVillageChange}
                 className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border"
               >
                 <option value="" disabled>Select your village</option>
                 {locations.map((loc) => (
                   <option key={loc.id} value={loc.id}>
                     {loc.name}
                   </option>
                 ))}
               </select>
               {locations.length === 0 && (
                   <p className="text-xs text-gray-500 mt-1">Fetching locations...</p>
               )}
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Sign Up
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

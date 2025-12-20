import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authFetch } from '../utils/api';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    users: 0,
    locations: 0,
    events: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const [usersRes, locationsRes] = await Promise.all([
                authFetch('/api/user/all').catch(() => ({ ok: false })),
                authFetch('/api/location/all').catch(() => ({ ok: false }))
            ]);

            const users = usersRes.ok ? await usersRes.json() : [];
            const locations = locationsRes.ok ? await locationsRes.json() : [];

            setStats({
                users: Array.isArray(users) ? users.length : 0,
                locations: Array.isArray(locations) ? locations.length : 0,
                events: 0
            });
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h2 className="text-gray-500 text-sm font-uppercase font-bold">Total Users</h2>
          <p className="text-4xl font-bold text-gray-800">{stats.users}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h2 className="text-gray-500 text-sm font-uppercase font-bold">Total Locations</h2>
          <p className="text-4xl font-bold text-gray-800">{stats.locations}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h2 className="text-gray-500 text-sm font-uppercase font-bold">System Status</h2>
          <p className="text-4xl font-bold text-gray-800">Active</p>
        </div>
      </div>

      <div className="flex space-x-4">
        <Link to="/admin/manage" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Manage System
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

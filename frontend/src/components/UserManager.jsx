import React, { useState, useEffect, useMemo } from 'react';
import LocationSelector from './LocationSelector';
import { authFetch } from '../utils/api';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'asc' });
    
    // User creation form
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'USER',
        village: null
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await authFetch('/api/user/all');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!formData.village) {
            setMessage('Please select a valid village.');
            return;
        }

        try {
            const payload = {
                username: formData.username,
                password: formData.password,
                role: formData.role,
                village: formData.village
            };
            
            const response = await authFetch('/api/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setMessage('User created successfully!');
                setShowAddForm(false);
                setFormData({ username: '', password: '', role: 'USER', village: null });
                fetchUsers();
            } else {
                setMessage('Failed to create user. ' + (await response.text()));
            }

        } catch (error) {
            setMessage('Error: ' + error.message);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedUsers = useMemo(() => {
        let result = [...users];

        // Search filtering
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(u => 
                u.username.toLowerCase().includes(lowerSearch) ||
                u.role.toLowerCase().includes(lowerSearch) ||
                (u.village && u.village.name.toLowerCase().includes(lowerSearch))
            );
        }

        // Sorting
        result.sort((a, b) => {
            let valA, valB;
            
            if (sortConfig.key === 'village') {
                valA = a.village ? a.village.name : '';
                valB = b.village ? b.village.name : '';
            } else {
                valA = a[sortConfig.key];
                valB = b[sortConfig.key];
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [users, searchTerm, sortConfig]);

    const SortIndicator = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <span className="ml-1 opacity-30 text-xs">↕</span>;
        return <span className="ml-1 text-indigo-600 font-bold">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                    <p className="text-sm text-gray-500">Manage system users and their access levels.</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                        showAddForm 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
                    }`}
                >
                    {showAddForm ? (
                        <><span className="text-xl">×</span> Cancel</>
                    ) : (
                        <><span className="text-xl">+</span> Add New User</>
                    )}
                </button>
            </div>

            {message && (
                <div className={`p-4 mb-6 rounded-xl text-sm font-medium ${
                    message.includes('successfully') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                    {message}
                </div>
            )}

            {showAddForm && (
                <div className="mb-8 p-6 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <h3 className="text-lg font-semibold mb-6 text-gray-800">Create New User</h3>
                    
                    <form onSubmit={handleCreateUser}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                                <input 
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Enter username"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                <input 
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                                <select 
                                    value={formData.role} 
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Location (Village)</label>
                            <div className="bg-white p-4 border border-gray-200 rounded-xl">
                                <LocationSelector onLocationSelect={(loc) => setFormData(prev => ({ ...prev, village: loc }))} />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-medium">
                                Create User
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toolbar: Search and Export etc */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input 
                        type="text"
                        placeholder="Search by username, role or village..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>
                <div className="text-sm text-gray-500 font-medium">
                    Showing {filteredAndSortedUsers.length} of {users.length} users
                </div>
            </div>

            <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th 
                                className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors"
                                onClick={() => handleSort('username')}
                            >
                                <div className="flex items-center">
                                    Username
                                    <SortIndicator columnKey="username" />
                                </div>
                            </th>
                            <th 
                                className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors"
                                onClick={() => handleSort('role')}
                            >
                                <div className="flex items-center">
                                    Role
                                    <SortIndicator columnKey="role" />
                                </div>
                            </th>
                            <th 
                                className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors"
                                onClick={() => handleSort('village')}
                            >
                                <div className="flex items-center">
                                    Village
                                    <SortIndicator columnKey="village" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredAndSortedUsers.map((u, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                                        u.role === 'ADMIN' 
                                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                    }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {u.village ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                            {u.village.name}
                                        </div>
                                    ) : (
                                        <span className="text-gray-300 italic">No village assigned</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredAndSortedUsers.length === 0 && !loading && (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                                            <span className="text-3xl grayscale opacity-30">🔍</span>
                                        </div>
                                        <p className="text-gray-500 font-medium">No users found matching your search.</p>
                                        <button 
                                            onClick={() => setSearchTerm('')}
                                            className="mt-2 text-indigo-600 text-sm font-semibold hover:text-indigo-700"
                                        >
                                            Clear all filters
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center">
                                    <div className="flex justify-center items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm font-medium text-gray-500">Loading users...</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManager;

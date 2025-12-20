import React, { useState, useEffect, useMemo } from 'react';
import LocationSelector from './LocationSelector';
import { authFetch } from '../utils/api';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'asc' });
    
    // User creation form
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'USER',
        village: null
    });
    const [message, setMessage] = useState('');

    // User Edit Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        password: '',
        village: null
    });

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(0); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchUsers(currentPage, debouncedSearch);
    }, [currentPage, debouncedSearch]);

    const fetchUsers = async (page, search) => {
        setLoading(true);
        try {
            const response = await authFetch(`/api/user/all?search=${encodeURIComponent(search)}&page=${page}&size=${pageSize}`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data.content);
                setTotalPages(data.totalPages);
                setTotalElements(data.totalElements);
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
                fetchUsers(currentPage, debouncedSearch);
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

    const handleOpenModal = (user) => {
        setSelectedUser(user);
        setEditFormData({
            password: '',
            village: user.village
        });
        setIsModalOpen(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const payload = {
                password: editFormData.password,
                villageName: editFormData.village ? editFormData.village.name : null
            };
            
            const response = await authFetch(`/api/user/${selectedUser.username}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setMessage('User updated successfully!');
                setIsModalOpen(false);
                fetchUsers(currentPage, debouncedSearch);
            } else {
                setMessage('Failed to update user. ' + (await response.text()));
            }
        } catch (error) {
            setMessage('Error: ' + error.message);
        }
    };

    const handleDeleteUser = async () => {
        if (!window.confirm(`Are you sure you want to delete user ${selectedUser.username}?`)) return;
        
        try {
            const response = await authFetch(`/api/user/${selectedUser.username}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setMessage('User deleted successfully!');
                setIsModalOpen(false);
                fetchUsers(currentPage, debouncedSearch);
            } else {
                setMessage('Failed to delete user. ' + (await response.text()));
            }
        } catch (error) {
            setMessage('Error: ' + error.message);
        }
    };

    const sortedUsers = useMemo(() => {
        let result = [...users];

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
    }, [users, sortConfig]);

    const SortIndicator = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <span className="ml-1 opacity-30 text-xs">↕</span>;
        return <span className="ml-1 text-indigo-600 font-bold">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {/* User Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Manage User: {selectedUser?.username}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors text-2xl">×</button>
                        </div>
                        
                        <form onSubmit={handleUpdateUser} className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reset Password</label>
                                <input 
                                    type="password"
                                    value={editFormData.password}
                                    onChange={e => setEditFormData({...editFormData, password: e.target.value})}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Enter new password (optional)"
                                />
                                <p className="text-xs text-gray-400 mt-1">Leave blank to keep current password.</p>
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Change Location (Village)</label>
                                <div className="bg-gray-50 p-4 border border-gray-200 rounded-xl">
                                    <LocationSelector 
                                        initialLocation={editFormData.village}
                                        onLocationSelect={(loc) => setEditFormData(prev => ({ ...prev, village: loc }))} 
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100">
                                    Update User Info
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleDeleteUser}
                                    className="w-full bg-rose-50 text-rose-600 py-3 rounded-xl hover:bg-rose-100 transition-all font-bold border border-rose-100"
                                >
                                    Delete User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                    {loading ? 'Searching...' : `Found ${totalElements} users`}
                </div>
            </div>

            <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm mb-6">
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
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {sortedUsers.map((u, idx) => (
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
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <button 
                                        onClick={() => handleOpenModal(u)}
                                        className="text-indigo-600 font-bold hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 transition-colors"
                                    >
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {sortedUsers.length === 0 && !loading && (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center">
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
                        {loading && users.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center">
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                    <div className="text-sm text-gray-500 font-medium">
                        Page <span className="text-gray-900">{currentPage + 1}</span> of <span className="text-gray-900">{totalPages}</span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            disabled={currentPage === 0 || loading}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i)}
                                className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-xl transition-all ${
                                    currentPage === i 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                                    : 'text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                                }`}
                            >
                                {i + 1}
                            </button>
                        )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 3))}
                        <button 
                            disabled={currentPage === totalPages - 1 || loading}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;

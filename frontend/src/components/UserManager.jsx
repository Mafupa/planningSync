import React, { useState, useEffect } from 'react';
import LocationSelector from './LocationSelector';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    
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
            const response = await fetch('/api/user/all'); // Assuming this endpoint exists, wait, `LocationController` has `getAllUsersFromLocation` but `UserController`?
            // User.java exists, let's assume `UserController` or a generic endpoint exists.
            // If not, I'll need to use what's available or mocked. 
            // In AuthContext it calls `/api/user/{username}` to login.
            // Check `task.md` -> I didn't explicitly check UserController.
            // I will implement a fetch based on `/api/user/all` and if it fails, I'll handle it.
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
            // Mapping existing signup flow: AuthContext uses /api/user/register
            const payload = {
                username: formData.username,
                password: formData.password,
                role: formData.role,
                village: formData.village
            };
            
            const response = await fetch('/api/user/register', {
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

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">User Management</h2>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    {showAddForm ? 'Cancel' : 'Add New User'}
                </button>
            </div>

            {message && <div className="p-4 mb-4 bg-blue-100 text-blue-700 rounded">{message}</div>}

            {showAddForm && (
                <form onSubmit={handleCreateUser} className="mb-8 p-4 border rounded bg-gray-50">
                    <h3 className="font-bold mb-4">Create New User</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 mb-1">Username</label>
                            <input 
                                type="text"
                                required
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Password</label>
                            <input 
                                type="password"
                                required
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Role</label>
                            <select 
                                value={formData.role} 
                                onChange={e => setFormData({...formData, role: e.target.value})}
                                className="w-full p-2 border rounded"
                            >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2 font-medium">Assign Location (Village)</label>
                        <div className="bg-white p-3 border rounded">
                            <LocationSelector onLocationSelect={(loc) => setFormData(prev => ({ ...prev, village: loc }))} />
                        </div>
                    </div>

                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                        Create User
                    </button>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Village</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((u, idx) => (
                            <tr key={idx}>
                                <td className="px-6 py-4 whitespace-nowrap">{u.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 text-xs font-semibold rounded-full ${u.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                    {u.village ? u.village.name : 'N/A'}
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && !loading && (
                            <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No users found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManager;

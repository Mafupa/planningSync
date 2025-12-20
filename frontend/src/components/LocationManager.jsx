import React, { useState, useEffect, useMemo } from 'react';
import { authFetch } from '../utils/api';

const LocationManager = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    const [formData, setFormData] = useState({
        name: '',
        type: 'PROVINCE',
        parentLocation: null
    });
    const [message, setMessage] = useState('');

    const locationTypes = ['PROVINCE', 'DISTRICT', 'SECTOR', 'CELL', 'VILLAGE'];

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const response = await authFetch('/api/location/all');
            if (response.ok) {
                const data = await response.json();
                setLocations(data);
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
        } finally {
            setLoading(false);
        }
    };

    const getParentType = (type) => {
        switch (type) {
            case 'DISTRICT': return 'PROVINCE';
            case 'SECTOR': return 'DISTRICT';
            case 'CELL': return 'SECTOR';
            case 'VILLAGE': return 'CELL';
            default: return null;
        }
    };

    const getAvailableParents = () => {
        const parentType = getParentType(formData.type);
        if (!parentType) return [];
        return locations.filter(loc => loc.type === parentType);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        
        const payload = {
            name: formData.name,
            type: formData.type,
            parentLocation: formData.parentLocation ? { name: formData.parentLocation } : null 
        };

        try {
            const response = await authFetch('/api/location/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setMessage('Location added successfully!');
                setShowAddForm(false);
                setFormData({ name: '', type: 'PROVINCE', parentLocation: null });
                fetchLocations();
            } else {
                setMessage('Failed to add location.');
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

    const filteredAndSortedLocations = useMemo(() => {
        let result = [...locations];

        // Search filtering
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(loc => 
                loc.name.toLowerCase().includes(lowerSearch) ||
                loc.type.toLowerCase().includes(lowerSearch) ||
                (loc.parentLocation && loc.parentLocation.name.toLowerCase().includes(lowerSearch))
            );
        }

        // Sorting
        result.sort((a, b) => {
            let valA, valB;
            
            if (sortConfig.key === 'parent') {
                valA = a.parentLocation ? a.parentLocation.name : '';
                valB = b.parentLocation ? b.parentLocation.name : '';
            } else {
                valA = a[sortConfig.key];
                valB = b[sortConfig.key];
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [locations, searchTerm, sortConfig]);

    const SortIndicator = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <span className="ml-1 opacity-30 text-xs">↕</span>;
        return <span className="ml-1 text-indigo-600 font-bold">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Location Management</h2>
                    <p className="text-sm text-gray-500">Manage hierarchical administrative units.</p>
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
                        <><span className="text-xl">+</span> Add New Location</>
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
                    <h3 className="text-lg font-semibold mb-6 text-gray-800">Add New Location</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location Type</label>
                                <select 
                                    value={formData.type} 
                                    onChange={(e) => setFormData({...formData, type: e.target.value, parentLocation: null})}
                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                >
                                    {locationTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {formData.type !== 'PROVINCE' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent {getParentType(formData.type)}</label>
                                    <select 
                                        required
                                        value={formData.parentLocation || ''} 
                                        onChange={(e) => setFormData({...formData, parentLocation: e.target.value})}
                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    >
                                        <option value="">Select Parent...</option>
                                        {getAvailableParents().map(loc => (
                                            <option key={loc.id || loc.name} value={loc.name}>
                                                {loc.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className={formData.type === 'PROVINCE' ? 'md:col-span-2' : ''}>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Enter location name"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-medium">
                                Add Location
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input 
                        type="text"
                        placeholder="Search by name, type or parent..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>
                <div className="text-sm text-gray-500 font-medium">
                    Showing {filteredAndSortedLocations.length} of {locations.length} locations
                </div>
            </div>

            <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th 
                                className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center">
                                    Name
                                    <SortIndicator columnKey="name" />
                                </div>
                            </th>
                            <th 
                                className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors"
                                onClick={() => handleSort('type')}
                            >
                                <div className="flex items-center">
                                    Type
                                    <SortIndicator columnKey="type" />
                                </div>
                            </th>
                            <th 
                                className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors"
                                onClick={() => handleSort('parent')}
                            >
                                <div className="flex items-center">
                                    Parent
                                    <SortIndicator columnKey="parent" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredAndSortedLocations.map((loc, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loc.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-lg 
                                        ${loc.type === 'PROVINCE' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 
                                          loc.type === 'DISTRICT' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                                          loc.type === 'SECTOR' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                                          loc.type === 'CELL' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                                        {loc.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {loc.parentLocation ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                            {loc.parentLocation.name}
                                        </div>
                                    ) : (
                                        <span className="text-gray-300 italic">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredAndSortedLocations.length === 0 && !loading && (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                                            <span className="text-3xl grayscale opacity-30">🔍</span>
                                        </div>
                                        <p className="text-gray-500 font-medium">No locations found matching your search.</p>
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
                                        <span className="text-sm font-medium text-gray-500">Loading locations...</span>
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

export default LocationManager;

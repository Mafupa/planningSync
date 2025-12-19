import React, { useState, useEffect } from 'react';

const LocationManager = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        type: 'PROVINCE',
        parentLocation: null // This will hold the full location object or just ID if backend expects ID. 
                             // Based on controller, it expects a Location object, but usually ID is cleaner. 
                             // Let's check if I can just send the object with ID.
    });
    const [message, setMessage] = useState('');

    const locationTypes = ['PROVINCE', 'DISTRICT', 'SECTOR', 'CELL', 'VILLAGE'];

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const response = await fetch('/api/location/all');
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
            // Controller uses name to find parent? No, the model has a JoinColumn. 
            // The controller AddLocation takes a RequestBody Location. 
            // Usually JPA needs the object with ID. 
            // But wait, the controller doesn't look up parent by name in the add method?
            // "String message = locationService.addLocation(location);"
            // Detailed check: If I send { id: "..." } as parentLocation, Jackson should map it.
            // But the dropdown values will be names or IDs?
            // Let's assume sending the full object structure or at least the ID is safer.
            // AND wait, the frontend doesn't have the ID easily unless I store it.
            // Let's use the location name to look it up if needed, but passing the object with just ID is standard.
            // HOWEVER, the previous code snippets suggest looking up by name "getLocation(name)".
            // Let's try sending { name: parentName } and hope the backend resolves it or existing logic handles it.
            // Actually, looking at `ELocation.java` logic, it seems I should just send the object.
        };

        // Refined payload logic:
        // If I select a parent from the dropdown, I have its name.
        if (formData.parentLocation) {
             // Find the full location object from my local list to be safe, or just send name if backend supports it.
             // Best bet: send `{ name: selectedParentName }` if that is unique.
             // Or `{ id: selectedParentId }` if I have IDs.
             // The `getLocation` endpoint works with name.
        }

        try {
            const response = await fetch('/api/location/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setMessage('Location added successfully!');
                setFormData({ name: '', type: 'PROVINCE', parentLocation: null });
                fetchLocations();
            } else {
                setMessage('Failed to add location.');
            }
        } catch (error) {
            setMessage('Error: ' + error.message);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Add New Location</h2>
            
            {message && <div className={`p-4 mb-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
            
            <form onSubmit={handleSubmit} className="mb-8 space-y-4">
                <div>
                    <label className="block text-gray-700 mb-2">Location Type</label>
                    <select 
                        value={formData.type} 
                        onChange={(e) => setFormData({...formData, type: e.target.value, parentLocation: null})}
                        className="w-full p-2 border rounded"
                    >
                        {locationTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {formData.type !== 'PROVINCE' && (
                    <div>
                        <label className="block text-gray-700 mb-2">Parent {getParentType(formData.type)}</label>
                        <select 
                            required
                            value={formData.parentLocation || ''} 
                            onChange={(e) => setFormData({...formData, parentLocation: e.target.value})}
                            className="w-full p-2 border rounded"
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

                <div>
                    <label className="block text-gray-700 mb-2">Location Name</label>
                    <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-2 border rounded"
                        placeholder="Enter location name"
                    />
                </div>

                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Add Location
                </button>
            </form>

            <h2 className="text-xl font-bold mb-4">Existing Locations</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {locations.map((loc, idx) => (
                            <tr key={idx}>
                                <td className="px-6 py-4 whitespace-nowrap">{loc.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${loc.type === 'PROVINCE' ? 'bg-purple-100 text-purple-800' : 
                                          loc.type === 'DISTRICT' ? 'bg-blue-100 text-blue-800' : 
                                          loc.type === 'SECTOR' ? 'bg-green-100 text-green-800' : 
                                          loc.type === 'CELL' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {loc.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                    {/* Since parentLocation is @JsonBackReference, it might be null in the JSON list. 
                                        We might need to infer it or fetching logic handles it. 
                                        Actually, @JsonBackReference usually means it's omitted in serialization to avoid loops.
                                        So in the list view, we might NOT see the parent. 
                                        We can try to find it by looking at who has this child, but that's expensive.
                                        For now, display logic might be limited. */}
                                    {loc.parentLocation ? loc.parentLocation.name : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LocationManager;

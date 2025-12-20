import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/api';

const LocationSelector = ({ onLocationSelect }) => {
    // Props: onLocationSelect(villageId) - called when a village is selected
    
    const [locations, setLocations] = useState({
        provinces: [],
        districts: [],
        sectors: [],
        cells: [],
        villages: []
    });
    
    // Store all raw locations to filter locally
    const [allLocations, setAllLocations] = useState([]);

    const [selected, setSelected] = useState({
        province: '',
        district: '',
        sector: '',
        cell: '',
        village: ''
    });

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await authFetch('/api/location/all');
                if (response.ok) {
                    const data = await response.json();
                    setAllLocations(data);
                    
                    // Initial load: get provinces
                    const provinces = data.filter(l => l.type === 'PROVINCE');
                    setLocations(prev => ({ ...prev, provinces }));
                }
            } catch (error) {
                console.error("Error loading locations", error);
            }
        };
        fetchLocations();
    }, []);

    // Filter children helper. 
    // Since parent structure might be hidden (@JsonBackReference), we rely on... wait.
    // If the PARENT is hidden in the child, we can't filter "where child.parent == selected".
    // We have to rely on `parent.children` if available, OR we are in trouble.
    // Let's check `Location.java`: `children` is `@JsonManagedReference`, so it SHOULD be serialized.
    // So looking at a Province object, we should see `children` (Districts).
    
    const handleProvinceChange = (e) => {
        const provinceName = e.target.value;
        const province = allLocations.find(l => l.name === provinceName);
        
        setSelected({ province: provinceName, district: '', sector: '', cell: '', village: '' });
        
        // Update districts
        // If children are populated:
        // const districts = province ? province.children : [];
        // If the backend fetchAll returns a flat list where children are populated, this works.
        // If fetchAll returns a flat list and children are empty lazy loaded? 
        // We will assume `children` is present.
        // Fallback: search allLocations for items where parent.name === provinceName (but parent is missing in JSON).
        // So we MUST rely on `children` being present in the parents.
        
        if (province && province.children) {
             setLocations(prev => ({ ...prev, districts: province.children }));
        } else {
             setLocations(prev => ({ ...prev, districts: [] }));
        }
        
        // Notify parent clear
        onLocationSelect(null);
    };

    const handleDistrictChange = (e) => {
        const districtName = e.target.value;
        // Search in the CURRENTLY displayed districts to find the object (for its children)
        // or search allLocations if needed, but uniqueness of names is key.
        const district = locations.districts.find(l => l.name === districtName);
        
        setSelected(prev => ({ ...prev, district: districtName, sector: '', cell: '', village: '' }));
        
        if (district && district.children) {
            setLocations(prev => ({ ...prev, sectors: district.children }));
        } else {
            setLocations(prev => ({ ...prev, sectors: [] }));
        }
    };

    const handleSectorChange = (e) => {
        const sectorName = e.target.value;
        const sector = locations.sectors.find(l => l.name === sectorName);
        
        setSelected(prev => ({ ...prev, sector: sectorName, cell: '', village: '' }));
        
        if (sector && sector.children) {
            setLocations(prev => ({ ...prev, cells: sector.children }));
        } else {
            setLocations(prev => ({ ...prev, cells: [] }));
        }
    };

    const handleCellChange = (e) => {
        const cellName = e.target.value;
        const cell = locations.cells.find(l => l.name === cellName);
        
        setSelected(prev => ({ ...prev, cell: cellName, village: '' }));
        
        if (cell && cell.children) {
            setLocations(prev => ({ ...prev, villages: cell.children }));
        } else {
            setLocations(prev => ({ ...prev, villages: [] }));
        }
    };

    const handleVillageChange = (e) => {
        const villageName = e.target.value;
        const village = locations.villages.find(l => l.name === villageName);
        
        setSelected(prev => ({ ...prev, village: villageName }));
        
        if (village) {
            onLocationSelect(village); // Pass the whole village object or ID
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Province</label>
                    <select value={selected.province} onChange={handleProvinceChange} className="mt-1 block w-full border rounded p-2">
                        <option value="">Select Province</option>
                        {locations.provinces.map(l => <option key={l.id || l.name} value={l.name}>{l.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">District</label>
                    <select value={selected.district} onChange={handleDistrictChange} disabled={!selected.province} className="mt-1 block w-full border rounded p-2 disabled:bg-gray-100">
                        <option value="">Select District</option>
                        {locations.districts.map(l => <option key={l.id || l.name} value={l.name}>{l.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Sector</label>
                    <select value={selected.sector} onChange={handleSectorChange} disabled={!selected.district} className="mt-1 block w-full border rounded p-2 disabled:bg-gray-100">
                        <option value="">Select Sector</option>
                        {locations.sectors.map(l => <option key={l.id || l.name} value={l.name}>{l.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Cell</label>
                    <select value={selected.cell} onChange={handleCellChange} disabled={!selected.sector} className="mt-1 block w-full border rounded p-2 disabled:bg-gray-100">
                        <option value="">Select Cell</option>
                        {locations.cells.map(l => <option key={l.id || l.name} value={l.name}>{l.name}</option>)}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Village</label>
                    <select value={selected.village} onChange={handleVillageChange} disabled={!selected.cell} className="mt-1 block w-full border rounded p-2 disabled:bg-gray-100">
                        <option value="">Select Village</option>
                        {locations.villages.map(l => <option key={l.id || l.name} value={l.name}>{l.name}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default LocationSelector;

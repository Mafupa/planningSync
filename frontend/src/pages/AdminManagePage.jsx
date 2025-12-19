import React, { useState } from 'react';
import LocationManager from '../components/LocationManager';
import UserManager from '../components/UserManager';
import Button from '../components/Button';

const AdminManagePage = () => {
  const [activeTab, setActiveTab] = useState('locations');

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">System Management</h1>
      
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Button
            variant={activeTab === 'locations' ? 'onTab' : 'offTab'}
            onClick={() => setActiveTab('locations')}
          >
            Manage Locations
          </Button>
          <Button
            variant={activeTab === 'users' ? 'onTab' : 'offTab'}
            onClick={() => setActiveTab('users')}
          >
            Manage Users
          </Button>
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === 'locations' && <LocationManager />}
        {activeTab === 'users' && <UserManager />}
      </div>
    </div>
  );
};

export default AdminManagePage;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    publicEvent: false
  });

  const fetchEvents = async () => {
    try {
      const res = await fetch(`/api/event/user/${user.id}`);
      if (res.ok) {
        setEvents(await res.json());
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchEvents();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/event/create/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ title: '', description: '', dateTime: '', publicEvent: false });
        fetchEvents();
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  if (loading) return <div className="p-8 text-center">Loading events...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Events</h1>
           <p className="text-gray-500 text-sm">Manage your schedule and public events.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {showForm ? 'Cancel' : 'Create Event'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">New Event</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date & Time</label>
              <input
                type="datetime-local"
                name="dateTime"
                required
                value={formData.dateTime}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              />
            </div>
            <div className="flex items-center">
              <input
                id="publicEvent"
                name="publicEvent"
                type="checkbox"
                checked={formData.publicEvent}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="publicEvent" className="ml-2 block text-sm text-gray-900">
                Make this event public
              </label>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save Event
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-md border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {events.length > 0 ? (
            events.map((event) => (
              <li key={event.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                   <div>
                        <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-indigo-600 truncate">{event.title}</h3>
                            {event.publicEvent && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Public
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500 flex items-center">
                           <span className="font-semibold mr-2">
                               {new Date(event.dateTime).toLocaleDateString()}
                           </span>
                           {new Date(event.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="mt-2 text-sm text-gray-600">{event.description}</p>
                   </div>
                   {/* Actions could go here (Edit/Delete) */}
                </div>
              </li>
            ))
          ) : (
            <li className="p-6 text-center text-gray-500">No events found. Start planning!</li>
          )}
        </ul>
      </div>
    </div>
  );
}

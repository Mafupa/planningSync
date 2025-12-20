import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authFetch } from '../utils/api';

export default function HabitsPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    timeOfDay: '',
    recurrenceType: 'DAILY' // Default
  });

  const fetchHabits = async () => {
    try {
      // Assuming GET /api/habits/allfrom/{username}
      const res = await authFetch(`/api/habits/allfrom/${user.username}`);
      if (res.ok) {
        setHabits(await res.json());
      }
    } catch (error) {
      console.error("Error fetching habits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchHabits();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Assuming POST /api/habits/{username}
      const res = await authFetch(`/api/habits/${user.username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ name: '', description: '', timeOfDay: '', recurrenceType: 'DAILY' });
        fetchHabits();
      }
    } catch (error) {
      console.error("Error creating habit:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="p-8 text-center">Loading habits...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Habits</h1>
           <p className="text-gray-500 text-sm">Build consistency with daily tracking.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {showForm ? 'Cancel' : 'Add Habit'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">New Habit</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Habit Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Read 30 mins"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleChange}
                placeholder="Why do you want to build this habit?"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700">Time of Day</label>
                   <input
                        type="time"
                        name="timeOfDay"
                        required
                        value={formData.timeOfDay}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700">Recurrence</label>
                   <select
                        name="recurrenceType"
                        value={formData.recurrenceType}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                   >
                       <option value="DAILY">Daily</option>
                       <option value="WEEKLY">Weekly</option>
                       {/* Add other backend supported enums if needed */}
                   </select>
                </div>
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start Tracking
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-md border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {habits.length > 0 ? (
            habits.map((habit) => (
              <li key={habit.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                   <div>
                        <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-indigo-600 truncate">{habit.name}</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                {habit.recurrenceType}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            {habit.description}
                        </p>
                        <p className="mt-2 text-sm text-gray-600 flex items-center">
                           <span className="mr-2">⏰ {habit.timeOfDay}</span>
                        </p>
                   </div>
                </div>
              </li>
            ))
          ) : (
            <li className="p-6 text-center text-gray-500">No habits yet. Add one to get started!</li>
          )}
        </ul>
      </div>
    </div>
  );
}

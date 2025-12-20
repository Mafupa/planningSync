import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authFetch } from '../utils/api';
import HabitTimeline from '../components/HabitTimeline';

export default function HabitsPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState({}); // { habitId: boolean }
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    timeOfDay: '',
    recurrenceType: 'DAILY' // Default
  });

  const fetchTodayLogs = async (habitList) => {
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const logsMap = {};
    await Promise.all(habitList.map(async (habit) => {
        // We only need the most recent log to check today
        const res = await authFetch(`/api/habitlog/by-habit/${habit.id}?size=1&sortBy=date&sortDir=desc`);
        if (res.ok) {
            const data = await res.json();
            const lastLog = data.content[0];
            logsMap[habit.id] = (lastLog && lastLog.date === todayStr && lastLog.completed);
        }
    }));
    setTodayLogs(logsMap);
  };

  const fetchHabits = async () => {
    try {
      const res = await authFetch(`/api/habits/allfrom/${user.username}`);
      if (res.ok) {
        const data = await res.json();
        setHabits(data);
        fetchTodayLogs(data);
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

  const handleToggleLog = async (habitId, date) => {
    try {
      const res = await authFetch(`/api/habitlog/toggle/${habitId}?date=${date}`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchHabits(); // Refresh to update everything
        return true;
      }
    } catch (error) {
      console.error("Error toggling habit log:", error);
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Daily Habits</h1>
           <p className="text-gray-500 mt-1">Consistency is the key to excellence.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white transition-all ${
            showForm ? 'bg-gray-400 hover:bg-gray-500' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-100 hover:shadow-lg'
          }`}
        >
          {showForm ? 'Cancel' : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Habit
            </>
          )}
        </button>
      </div>

      {/* Habit Timeline Component */}
      <HabitTimeline habits={habits} onToggleLog={handleToggleLog} />

      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-indigo-50/50 border border-indigo-50 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            Create New Habit
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Habit Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Morning Meditation"
                className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 border transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Why do you want to build this habit?"
                className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 border transition-all"
              />
            </div>
            <div>
               <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Time</label>
               <input
                    type="time"
                    name="timeOfDay"
                    required
                    value={formData.timeOfDay}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 border transition-all"
                />
            </div>
            <div>
               <label className="block text-sm font-semibold text-gray-700 mb-1">Recurrence</label>
               <select
                    name="recurrenceType"
                    value={formData.recurrenceType}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 border transition-all"
               >
                   <option value="DAILY">Every Day</option>
                   <option value="WEEKLY">Once a Week</option>
               </select>
            </div>
            
            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                className="w-full inline-flex justify-center py-4 px-6 border border-transparent shadow-lg shadow-indigo-100 text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Start Journey
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.length > 0 ? (
          habits.map((habit) => {
            const isDoneToday = todayLogs[habit.id];
            const todayStr = new Date().toLocaleDateString('en-CA');
            return (
              <div 
                key={habit.id} 
                className={`group relative bg-white p-6 rounded-2xl border transition-all hover:shadow-xl hover:shadow-gray-100 ${
                  isDoneToday ? 'border-emerald-100 bg-emerald-50/10' : 'border-gray-100'
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-xl ${isDoneToday ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      {isDoneToday ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${
                      isDoneToday ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-500'
                    }`}>
                      {habit.recurrenceType}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                    {habit.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 line-clamp-2 min-h-[2.5rem]">
                    {habit.description || "No description provided."}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center text-sm font-medium text-gray-400">
                      <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {habit.timeOfDay}
                    </div>
                    
                    <button
                      onClick={() => handleToggleLog(habit.id, todayStr)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isDoneToday 
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                          : 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                      }`}
                    >
                      {isDoneToday ? 'Completed' : 'Done Today?'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No habits yet. Let's start building!</p>
          </div>
        )}
      </div>
    </div>
  );
}

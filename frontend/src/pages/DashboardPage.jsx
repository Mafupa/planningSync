import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { authFetch } from '../utils/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Fetch events: assuming GET /api/event/user/{userId} returns a Set of events
        const eventsRes = await authFetch(`/api/event/user/${user.id}`);
        if (eventsRes.ok) {
            const eventsData = await eventsRes.json();
            // Sort by date (ascending) and take next 3
            const sortedEvents = Array.isArray(eventsData) 
                ? eventsData.sort((a, b) => new Date(a.date) - new Date(b.date))
                : [];
            setEvents(sortedEvents.slice(0, 3));
        }

        // Fetch habits: GET /api/habits/allfrom/{username}
        const habitsRes = await authFetch(`/api/habits/allfrom/${user.username}`);
        if (habitsRes.ok) {
            const habitsData = await habitsRes.json();
            setHabits(Array.isArray(habitsData) ? habitsData : []);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  if (loading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
        <p className="mt-1 text-sm text-gray-500">Here's what's happening today.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Quick Stats */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Events</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{events.length}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Active Habits</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{habits.length}</dd>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Events Section */}
        <section className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Events</h2>
            <Link to="/events" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View all</Link>
          </div>
          {events.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {events.map((event) => (
                <li key={event.id} className="py-4">
                  <div className="flex space-x-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-500">{event.date} {event.time}</p>
                      </div>
                      <p className="text-sm text-gray-500">{event.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No upcoming events.</p>
          )}
        </section>

        {/* Habits Section */}
        <section className="bg-white shadow rounded-lg p-6">
           <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">My Habits</h2>
            <Link to="/habits" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View all</Link>
          </div>
          {habits.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {habits.map((habit) => (
                <li key={habit.id} className="py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{habit.title}</h3>
                    <p className="text-xs text-gray-500">{habit.description}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-gray-500 text-sm">No habits being tracked.</p>
          )}
        </section>
      </div>
    </div>
  );
}

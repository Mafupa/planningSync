import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import { authFetch } from '../utils/api';

// Inline Icons (replacing lucide-react)
const ChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 12"/></svg>;
const Clock = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '09:00', // Default time
    publicEvent: false
  });

  // Fetch Events
  const fetchEvents = async () => {
    try {
      const res = await authFetch(`/api/event/user/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
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

  // Calendar Logic
  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const getEventsForDate = (date) => {
    return events.filter(e => {
        const eventDate = new Date(e.dateTime);
        return isSameDay(eventDate, date);
    });
  };

  // Form Handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    const [hours, minutes] = formData.time.split(':');
    const eventDateTime = new Date(selectedDate);
    eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Format to ISO string but strip the 'Z' to match LocalDateTime if backend expects local time
    // Or just send standard ISO. Spring Boot often prefers 'yyyy-MM-ddTHH:mm:ss' for LocalDateTime.
    // '2023-10-27T09:00:00.000'
    const isoDateTime = eventDateTime.toISOString().slice(0, 19); 

    const payload = {
        title: formData.title,
        description: formData.description,
        publicEvent: formData.publicEvent,
        dateTime: isoDateTime
    };

    try {
      // Create event (using POST /create/{userId} from controller)
      const res = await authFetch(`/api/event/create/${user.id}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ title: '', description: '', time: '09:00', publicEvent: false });
        fetchEvents();
      } else {
          console.error("Failed to create event:", res.status, res.statusText);
          const txt = await res.text();
          console.error("Response:", txt);
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleDelete = async (eventId) => {
      if(!confirm("Are you sure you want to delete this event?")) return;
      try {
          const res = await authFetch(`/api/event/${eventId}`, { method: 'DELETE' });
          if(res.ok) fetchEvents();
      } catch (err) {
          console.error("Failed to delete", err);
      }
  };

  // Render Calendar Grid
  const renderCalendarDays = () => {
    const totalDays = daysInMonth(currentDate);
    const startDay = firstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for previous month
    for (let i = 0; i < startDay; i++) {
        // Use bg-gray-50 for empty cells, no border since parent has gap
      days.push(<div key={`empty-${i}`} className="bg-gray-50/50"></div>);
    }

    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const isSelected = isSameDay(date, selectedDate);
      const isToday = isSameDay(date, new Date());
      const dayEvents = getEventsForDate(date);

      days.push(
        <div
          key={i}
          onClick={() => setSelectedDate(date)}
          className={`min-h-[100px] p-2 bg-white cursor-pointer transition-colors relative hover:bg-gray-50
            ${isSelected ? 'ring-2 ring-inset ring-indigo-500 z-10' : ''}
            ${isToday ? 'bg-blue-50/30 font-semibold text-blue-600' : ''}`}
        >
          <span className={`text-sm ${isSelected ? 'font-bold text-indigo-700' : 'text-gray-700'}`}>
            {i}
          </span>
          {/* Dots for events */}
          <div className="flex flex-wrap gap-1 mt-1">
             {dayEvents.slice(0, 4).map((_, idx) => (
                 <div key={idx} className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
             ))}
             {dayEvents.length > 4 && <span className="text-[10px] text-gray-400">+</span>}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6 p-4">
      {/* Left: Calendar (2/3 width) */}
      <div className="flex-1 lg:flex-[2] bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
        {/* Calendar Header */}
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
           <h2 className="text-2xl font-bold text-gray-800">
             {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
           </h2>
           <div className="flex gap-2">
             <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronLeft /></button>
             <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition">Today</button>
             <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronRight /></button>
           </div>
        </div>
        
        {/* Days Header */}
        <div className="grid grid-cols-7 bg-gray-50/80 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{d}</div>
            ))}
        </div>

        {/* Days Grid - Using gap for separation instead of borders */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 flex-1 auto-rows-[minmax(100px,1fr)] overflow-y-auto border-b border-gray-200">
            {renderCalendarDays()}
        </div>
      </div>

      {/* Right: Day Panel (1/3 width) */}
      <div className="flex-1 lg:flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
         <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
             <div className="text-indigo-100 text-sm font-medium uppercase tracking-wide">
                 {selectedDate.toLocaleDateString('default', { weekday: 'long' })}
             </div>
             <h3 className="text-3xl font-bold mt-1">
                 {selectedDate.getDate()} <span className="text-lg font-normal opacity-80">{selectedDate.toLocaleDateString('default', { month: 'long' })}</span>
             </h3>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {getEventsForDate(selectedDate).length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                     <div className="opacity-50 mb-2"><CalendarIcon /></div>
                     <p className="text-sm">No events scheduled.</p>
                 </div>
             ) : (
                getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className="group p-4 bg-gray-50 hover:bg-white border hover:border-indigo-200 rounded-xl transition-all shadow-sm hover:shadow-md">
                        <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-gray-900 line-clamp-1">{event.title}</h4>
                            <button onClick={() => handleDelete(event.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity p-1">
                                <div className="w-4 h-4"><XIcon /></div>
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <div className="w-3.5 h-3.5"><Clock /></div>
                                {new Date(event.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {event.publicEvent && (
                                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-[10px] font-medium">Public</span>
                            )}
                        </div>
                    </div>
                ))
             )}
         </div>

         <div className="p-4 border-t border-gray-100 bg-gray-50">
             <button
               onClick={() => setShowModal(true)}
               className="w-full py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all font-medium flex items-center justify-center gap-2"
             >
                 <span>+</span> Add Event
             </button>
         </div>
      </div>

      {/* Add Event Modal */}
      {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-gray-900">Add Event for {selectedDate.toLocaleDateString()}</h3>
                      <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><XIcon /></button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                          <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            placeholder="e.g. Team Meeting"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                             rows={3}
                             value={formData.description}
                             onChange={(e) => setFormData({...formData, description: e.target.value})}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                             placeholder="Details about the event..."
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                              <input
                                type="time"
                                required
                                value={formData.time}
                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                              />
                          </div>
                          <div className="flex items-center pt-6">
                              <label className="flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={formData.publicEvent}
                                    onChange={(e) => setFormData({...formData, publicEvent: e.target.checked})}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">Make Public</span>
                              </label>
                          </div>
                      </div>
                      <div className="pt-4">
                          <button
                            type="submit"
                            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition shadow-sm"
                          >
                            Create Event
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import { authFetch } from '../utils/api';
import Button from '../components/Button';

// Inline Icons
const ChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
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
  const [editingEvent, setEditingEvent] = useState(null);
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

  const openModal = (event = null) => {
    if (event) {
        const eventDate = new Date(event.dateTime);
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description,
            time: eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            publicEvent: event.publicEvent
        });
    } else {
        setEditingEvent(null);
        setFormData({ title: '', description: '', time: '09:00', publicEvent: false });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData({ title: '', description: '', time: '09:00', publicEvent: false });
  };

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

    const isoDateTime = eventDateTime.toISOString().slice(0, 19); 

    const payload = {
        title: formData.title,
        description: formData.description,
        publicEvent: formData.publicEvent,
        dateTime: isoDateTime
    };

    try {
      const url = editingEvent 
        ? `/api/event/${editingEvent.id}` 
        : `/api/event/create/${user.id}`;
      const method = editingEvent ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        closeModal();
        fetchEvents();
      } else {
          console.error("Failed to save event:", res.status);
      }
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleDelete = async () => {
      if(!editingEvent || !confirm("Are you sure you want to delete this event?")) return;
      try {
          const res = await authFetch(`/api/event/${editingEvent.id}`, { method: 'DELETE' });
          if(res.ok) {
              closeModal();
              fetchEvents();
          }
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

         <div className="flex-1 overflow-y-auto p-4 space-y-4">
             {getEventsForDate(selectedDate).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                      <div className="opacity-50 mb-2"><CalendarIcon /></div>
                      <p className="text-sm">No events scheduled.</p>
                  </div>
              ) : (
                 getEventsForDate(selectedDate).map(event => (
                    <button 
                        key={event.id} 
                        onClick={() => openModal(event)}
                        className="w-full text-left group p-4 bg-white hover:bg-indigo-50/30 border border-gray-100 hover:border-indigo-200 rounded-2xl transition-all shadow-sm hover:shadow-md flex items-start gap-4 relative overflow-hidden"
                    >
                        {/* Status bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 transform -translate-x-1 group-hover:translate-x-0 transition-transform"></div>
                        
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{event.title}</h4>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                {event.description || "No description provided."}
                            </p>
                            <div className="mt-4 flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                                    {new Date(event.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                {event.publicEvent && (
                                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">Public Event</span>
                                )}
                            </div>
                        </div>
                    </button>
                 ))
              )}
         </div>

         <div className="p-4 border-t border-gray-100 bg-gray-50/50">
             <button
               onClick={() => openModal()}
               className="w-full py-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold flex items-center justify-center gap-2"
             >
                 <span className="text-xl">+</span> Add New Event
             </button>
         </div>
      </div>

      {/* Unified Event Modal */}
      {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
                  <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                      <div>
                        <h3 className="text-xl font-extrabold text-gray-900">
                            {editingEvent ? 'Edit Event' : 'New Event'}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                            {selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="w-12">
                        <Button onClick={closeModal} variant='secondary'>Close</Button>
                      </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-8 space-y-6">
                      <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Event Title</label>
                          <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                            placeholder="What's happening?"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                          <textarea
                             rows={3}
                             value={formData.description}
                             onChange={(e) => setFormData({...formData, description: e.target.value})}
                             className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 resize-none"
                             placeholder="Add some details..."
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                          <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Start Time</label>
                              <input
                                type="time"
                                required
                                value={formData.time}
                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                              />
                          </div>
                          <div className="flex items-center pt-6">
                              <label className="flex items-center group cursor-pointer">
                                  <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={formData.publicEvent}
                                        onChange={(e) => setFormData({...formData, publicEvent: e.target.checked})}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-6 rounded-full transition-colors ${formData.publicEvent ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.publicEvent ? 'translate-x-4' : ''}`}></div>
                                  </div>
                                  <span className="ml-3 text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">Public Event</span>
                              </label>
                          </div>
                      </div>
                      
                      <div className="flex flex-col gap-3 pt-4">
                          <button
                            type="submit"
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-bold transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
                          >
                            {editingEvent ? 'Save Changes' : 'Create Event'}
                          </button>
                          
                          {editingEvent && (
                              <button
                                type="button"
                                onClick={handleDelete}
                                className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 font-bold transition-all flex items-center justify-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                Delete Event
                              </button>
                          )}
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}

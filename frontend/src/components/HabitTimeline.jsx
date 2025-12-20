import React, { useState, useEffect, useRef, useCallback } from 'react';
import { authFetch } from '../utils/api';

const HabitTimeline = ({ habits, onToggleLog, streaks = {} }) => {
  const [daysRange, setDaysRange] = useState(14); // Default 2 weeks
  const [logs, setLogs] = useState({}); // { [habitId]: [ {date, completed}, ... ] }
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const fetchAllLogs = useCallback(async (range) => {
    setLoading(true);
    try {
      const logsMap = {};
      await Promise.all(habits.map(async (habit) => {
        const res = await authFetch(`/api/habitlog/by-habit/${habit.id}?size=${range}&sortBy=date&sortDir=desc`);
        if (res.ok) {
          const data = await res.json();
          logsMap[habit.id] = data.content;
        }
      }));
      setLogs(logsMap);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }, [habits]);

  useEffect(() => {
    if (habits.length > 0) {
      fetchAllLogs(daysRange);
    }
  }, [habits, daysRange, fetchAllLogs]);

  useEffect(() => {
    if (scrollRef.current && !loading) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [loading, daysRange]);

  // Generate date array based on range
  const dates = [...Array(daysRange)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (daysRange - 1 - i));
    return d;
  });

  const formatDate = (date) => {
    // Correctly handle local date string for comparisons
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isHabitDone = (habitId, dateStr) => {
    return logs[habitId]?.some(log => log.date === dateStr && log.completed);
  };

  const getStreakColor = (streak) => {
    if (streak <= 0) return '#d1d5db'; // gray-300
    if (streak === 1) return '#10b981'; // green-500
    if (streak === 2) return '#eab308'; // yellow-500
    
    // Day 2 to 30: Yellow (234, 179, 8) -> Red (239, 68, 68)
    const ratio = Math.min((streak - 2) / 28, 1);
    const r = Math.round(234 + (239 - 234) * ratio);
    const g = Math.round(179 + (68 - 179) * ratio);
    const b = Math.round(8 + (68 - 8) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getShadowColor = (streak) => {
    if (streak <= 0) return 'transparent';
    if (streak === 1) return 'rgba(16, 185, 129, 0.2)';
    if (streak === 2) return 'rgba(234, 179, 8, 0.2)';
    const ratio = Math.min((streak - 2) / 28, 1);
    const r = Math.round(234 + (239 - 234) * ratio);
    const g = Math.round(179 + (68 - 179) * ratio);
    const b = Math.round(8 + (68 - 8) * ratio);
    return `rgba(${r}, ${g}, ${b}, 0.2)`;
  };

  const handleToggle = async (habitId, dateStr) => {
    // Optimistic UI update
    setLogs(prev => ({
      ...prev,
      [habitId]: prev[habitId]?.map(log => 
        log.date === dateStr ? { ...log, completed: !log.completed } : log
      ) || [{ date: dateStr, completed: true }]
    }));

    const success = await onToggleLog(habitId, dateStr);
    if (!success) {
      // Revert on failure (simple implementation)
      fetchAllLogs(daysRange);
    } else {
        // Force refresh to ensure synchronization if toggle didn't update exactly as expected
        // Actually onToggleLog in HabitsPage calls fetchHabits which will trigger this timeline re-fetch via habits prop change
    }
  };

  const rangeOptions = [
    { label: '1 Week', value: 7 },
    { label: '2 Weeks', value: 14 },
    { label: '3 Weeks', value: 21 },
    { label: '1 Month', value: 30 },
    { label: '6 Months', value: 180 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50/30 gap-4">
        <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Activity Timeline</h2>
            <p className="text-[10px] text-gray-400">Track and manage your daily progress</p>
        </div>
        
        <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">View:</span>
            <select 
                value={daysRange}
                onChange={(e) => setDaysRange(parseInt(e.target.value))}
                className="text-xs font-semibold bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer shadow-sm hover:border-gray-300"
            >
                {rangeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className={`flex overflow-x-auto pb-4 pt-4 px-4 gap-4 scrollbar-hide snap-x relative ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        )}
        
        {dates.map((date, idx) => {
          const dateStr = formatDate(date);
          const isToday = dateStr === formatDate(new Date());
          
          return (
            <div 
              key={dateStr}
              className={`flex-shrink-0 w-32 snap-start flex flex-col items-center p-3 rounded-2xl transition-all ${
                isToday ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'bg-white border border-gray-100 hover:border-indigo-100'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isToday ? 'text-indigo-600' : 'text-gray-400'}`}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className={`text-lg font-black mb-4 ${isToday ? 'text-indigo-700' : 'text-gray-700'}`}>
                {date.getDate()}
              </span>
              
              <div className="w-full space-y-2">
                {habits.map(habit => {
                  const done = isHabitDone(habit.id, dateStr);
                  const streak = streaks[habit.id] || 0;
                  const color = getStreakColor(streak);
                  const shadow = getShadowColor(streak);
                  
                  return (
                    <button
                      key={habit.id}
                      onClick={() => handleToggle(habit.id, dateStr)}
                      className={`w-full group relative flex items-center justify-center h-8 rounded-lg transition-all ${
                        !done ? 'bg-gray-50 text-gray-300 hover:bg-gray-100 hover:text-gray-400' : 'text-white'
                      }`}
                      style={done ? { backgroundColor: color, boxShadow: `0 4px 6px -1px ${shadow}, 0 2px 4px -1px ${shadow}` } : {}}
                      title={`${habit.name}: ${done ? 'Completed' : 'Not completed'}`}
                    >
                      {done ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                      
                      <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-50">
                        {habit.name} {streak > 0 && `(🔥 ${streak})`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HabitTimeline;

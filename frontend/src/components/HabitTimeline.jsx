import React, { useRef, useEffect } from 'react';

const HabitTimeline = ({ habits, onToggleLog }) => {
  const scrollRef = useRef(null);

  // Generate last 14 days
  const dates = [...Array(14)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d;
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isHabitDone = (habit, dateStr) => {
    return habit.logs?.some(log => log.date === dateStr && log.completed);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Activity Timeline</h2>
        <span className="text-xs text-gray-400">Past 2 weeks</span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto pb-4 pt-4 px-4 gap-4 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
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
                  const done = isHabitDone(habit, dateStr);
                  return (
                    <button
                      key={habit.id}
                      onClick={() => onToggleLog(habit.id, dateStr)}
                      className={`w-full group relative flex items-center justify-center h-8 rounded-lg transition-all ${
                        done 
                          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200' 
                          : 'bg-gray-50 text-gray-300 hover:bg-gray-100 hover:text-gray-400'
                      }`}
                      title={`${habit.name}: ${done ? 'Completed' : 'Not completed'}`}
                    >
                      {done ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                      
                      {/* Tooltip on hover */}
                      <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-50">
                        {habit.name}
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

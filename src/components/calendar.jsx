import React, { useState } from 'react';
import { format, addDays, isSameDay } from 'date-fns';

function Calendar({ selectedDate, setSelectedDate }) {
  const [calendarOffset, setCalendarOffset] = useState(0);
  const today = new Date();
  
  // Calculate the days to display
  const days = Array.from({ length: 7 }, (_, i) => 
    addDays(today, i + calendarOffset - 2)
  );

  const handleDateClick = (day) => {
    setSelectedDate(day);
  };

  return (
    <div>
      <div className="scrollable-calendar">
        {days.map((day, index) => {
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          
          return (
            <button
              key={index}
              className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              {format(day, 'EEE d')}
            </button>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <b>{format(selectedDate, 'EEEE, dd MMMM yyyy')}</b>
      </div>
    </div>
  );
}

export default Calendar;
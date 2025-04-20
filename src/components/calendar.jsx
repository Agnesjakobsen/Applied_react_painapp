import React, { useEffect, useRef } from 'react';
import { format, addDays, isSameDay } from 'date-fns';

function Calendar({ selectedDate, setSelectedDate }) {
  const today = new Date();
  const calendarRef = useRef(null);

  // Calculate 5 days to display (2 days before, today, and 2 days after)
  const days = Array.from({ length: 5 }, (_, i) => 
    addDays(today, i - 2)
  );

  const handleDateClick = (day) => {
    setSelectedDate(day);
  };

  // Scroll to the current day on initial render
  useEffect(() => {
    const todayIndex = days.findIndex((day) => isSameDay(day, today));
    if (calendarRef.current && todayIndex !== -1) {
      const buttonWidth = calendarRef.current.children[0].offsetWidth;
      calendarRef.current.scrollLeft = buttonWidth * todayIndex - buttonWidth * 2;
    }
  }, [days, today]);

  return (
    <div className="scrollable-calendar" ref={calendarRef}>
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
  );
}

export default Calendar;

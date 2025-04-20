import React from 'react';
import Calendar from './calendar';

function Home({ username, selectedDate, setSelectedDate }) {
  // Helper function to get greeting based on time of day
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return 'Good morning';
    } else if (currentHour >= 12 && currentHour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };

  return (
    <div className="home-container">
      <div className="greeting">
        <h3>{getGreeting()}, {username}!</h3>
      </div>
      
      <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      
      <div className="relevant-content">
        <h3>Something relevant</h3>
        {/* This would be populated with relevant information based on the selected date */}
      </div>
    </div>
  );
}

export default Home;
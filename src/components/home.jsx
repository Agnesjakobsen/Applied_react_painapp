import React from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from './Calendar';
import { User } from 'lucide-react'; // Import a user icon

function Home({ username, selectedDate, setSelectedDate }) {
  const navigate = useNavigate();

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
      <div className="header">
        <button 
          className="profile-button" 
          onClick={() => navigate('/profile')}
          aria-label="Go to Profile"
        >
          <User size={24} />
        </button>
      </div>
      <div className="greeting-container">
        <h3 className="greeting">{getGreeting()}, {username}!</h3>
      </div>
      <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <div className="relevant-content">
        <h3>Today's Summary</h3>
        <p>No pain entries recorded for today. Tap + to add one.</p>
      </div>
    </div>
  );
}

export default Home;
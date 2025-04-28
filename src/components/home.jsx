import React from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "./Calendar";
import { User } from "lucide-react"; // Import a user icon
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase"; // Adjust path if needed
import { format } from "date-fns";

function Home({ username, selectedDate, setSelectedDate }) {
  const navigate = useNavigate();
  const [todayPainScore, setTodayPainScore] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTodayEntry = async () => {
      setLoading(true);
      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("pain_entries")
        .select("bpi5")
        .eq("date", formattedDate);

      if (error) {
        console.error("Error fetching today’s entry:", error);
      } else if (data.length > 0) {
        const avg =
          data.reduce((sum, entry) => sum + (entry.bpi5 || 0), 0) / data.length;
        setTodayPainScore(avg);
      } else {
        setTodayPainScore(null);
      }

      setLoading(false);
    };

    fetchTodayEntry();
  }, [selectedDate]);

  // Helper function to get greeting based on time of day
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return "Good morning";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  return (
    <div className="home-container">
      <div className="header">
        <button
          className="profile-button-home"
          onClick={() => navigate("/profile")}
          aria-label="Go to Profile"
        >
          <User size={24} />
        </button>
      </div>
      <div className="greeting-container">
        <h3 className="greeting">
          {getGreeting()}, {username}!
        </h3>
      </div>
      <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <div className="relevant-content">
        <h3>Today's Summary</h3>
        {loading ? (
          <p>Loading pain data...</p>
        ) : todayPainScore !== null ? (
          <p>
            Average pain score for today:{" "}
            <strong>{todayPainScore.toFixed(2)}</strong>
          </p>
        ) : (
          <p>
            No pain entry for {format(selectedDate, "MMMM d, yyyy")}. Tap + to
            add one.
          </p>
        )}
      </div>
    </div>
  );
}

export default Home;

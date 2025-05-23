import React from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "./calendar";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { format, isSameDay, isYesterday } from "date-fns";

function Home({ username, selectedDate, setSelectedDate }) {
  const navigate = useNavigate();
  const [todayPainScore, setTodayPainScore] = useState(null);
  const [highestPainScore, setHighestPainScore] = useState(null);
  const [lowestPainScore, setLowestPainScore] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTodayEntry = async () => {
      setLoading(true);
      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("pain_entries")
        .select("bpi3, bpi4, bpi5")
        .eq("date", formattedDate);

      if (error) {
        console.error("Error fetching today’s entry:", error);
      } else if (data.length > 0) {
        const avg =
          data.reduce((sum, entry) => sum + (entry.bpi5 ?? 0), 0) / data.length;

        const worstPain = Math.max(...data.map((entry) => entry.bpi3 ?? 0));
        const leastPain = Math.min(...data.map((entry) => entry.bpi4 ?? 0));

        setTodayPainScore(avg);
        setHighestPainScore(worstPain);
        setLowestPainScore(leastPain);
      } else {
        setTodayPainScore(null);
        setHighestPainScore(null);
        setLowestPainScore(null);
      }

      setLoading(false);
    };

    fetchTodayEntry();
  }, [selectedDate]);

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) return "Good morning";
    else if (currentHour >= 12 && currentHour < 18) return "Good afternoon";
    else return "Good evening";
  };

  const getCheckInTitle = () => {
    const today = new Date();

    if (isSameDay(selectedDate, today)) {
      return "Today's Check-In";
    } else if (isYesterday(selectedDate)) {
      return "Yesterday's Check-In";
    } else {
      return `${format(selectedDate, "MMMM d")} Check-In`;
    }
  };

  return (
    <div className="home-container">
      <div className="header">
        <button
          className="header-profile-button"
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

      <div className="summary-container">
        <h3>{getCheckInTitle()}</h3>
        {loading ? (
          <p>Loading pain data...</p>
        ) : todayPainScore !== null ? (
          <div>
            <p>
              <strong
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "1rem",
                }}
              >
                Average pain score:{" "}
                <span>
                  {Math.round(todayPainScore)}
                </span>
              </strong>
            </p>
            <p>
              Highest pain score:{" "}
              <strong>
                {highestPainScore}
              </strong>
            </p>
            <p>
              Lowest pain score:{" "}
              <strong>
                {lowestPainScore}
              </strong>
            </p>{" "}
          </div>
        ) : (
          <div>
            <p>No pain entry for {format(selectedDate, "MMMM d, yyyy")}.</p>
            <button
              className="calendar-day selected"
              onClick={() => navigate("/create-entry")}
              style={{
                marginTop: "3.5rem",
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Create Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;

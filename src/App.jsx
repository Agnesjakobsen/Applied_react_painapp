import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./components/home";
import CreateEntry from "./components/create_entry";
import Reports from "./components/reports";
import Profile from "./components/Profile";
import Login from "./components/login";
import NavBar from "./components/navbar";
import "./styles.css";
import PageTransition from "./components/PageTransition";

function AppContent({ loggedIn, username, selectedDate, setSelectedDate, authenticate, logout }) {
  const location = useLocation();

  return (
    <div className="app">
      <div className="main-content">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/login"
              element={
                loggedIn ? (
                  <Navigate to="/" replace />
                ) : (
                  <PageTransition>
                    <Login authenticate={authenticate} />
                  </PageTransition>
                )
              }
            />
            <Route
              path="/"
              element={
                loggedIn ? (
                  <PageTransition>
                    <Home
                      username={username}
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                    />
                  </PageTransition>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/create-entry"
              element={
                loggedIn ? (
                  <PageTransition>
                    <CreateEntry selectedDate={selectedDate} />
                  </PageTransition>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/reports"
              element={
                loggedIn ? (
                  <PageTransition>
                    <Reports />
                  </PageTransition>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                loggedIn ? (
                  <PageTransition>
                    <Profile username={username} logout={logout} />
                  </PageTransition>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
      {loggedIn && <NavBar />}
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setLoggedIn(true);
      setUsername(savedUsername);
    }
  }, []);

  const authenticate = (username, password) => {
    if (username && password) {
      setUsername(username);
      setLoggedIn(true);
      localStorage.setItem("username", username);
      return true;
    }
    return false;
  };

  const logout = () => {
    setLoggedIn(false);
    setUsername("");
    localStorage.removeItem("username");
  };

  return (
    <Router>
      <AppContent
        loggedIn={loggedIn}
        username={username}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        authenticate={authenticate}
        logout={logout}
      />
    </Router>
  );
}

export default App;

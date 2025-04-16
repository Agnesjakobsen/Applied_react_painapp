import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './components/Home';
import CreateEntry from './components/CreateEntry';
import Reports from './components/Reports';
import Profile from './components/Profile';
import Login from './components/Login';
import NavBar from './components/NavBar';
import './styles.css';

function App() {
  // Initialize state
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Check if user was previously logged in
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setLoggedIn(true);
      setUsername(savedUsername);
    }
  }, []);

  // Authentication function
  const authenticate = (username, password) => {
    // Simple auth for prototype
    if (username && password) {
      setUsername(username);
      setLoggedIn(true);
      localStorage.setItem('username', username);
      return true;
    }
    return false;
  };

  // Logout function
  const logout = () => {
    setLoggedIn(false);
    setUsername('');
    localStorage.removeItem('username');
  };

  return (
    <Router>
      <div className="app">
        <div className="main-content">
          <Routes>
            <Route 
              path="/login" 
              element={
                loggedIn ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login authenticate={authenticate} />
                )
              } 
            />
            <Route 
              path="/" 
              element={
                loggedIn ? (
                  <Home username={username} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/create-entry" 
              element={
                loggedIn ? (
                  <CreateEntry selectedDate={selectedDate} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/reports" 
              element={
                loggedIn ? (
                  <Reports />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/profile" 
              element={
                loggedIn ? (
                  <Profile username={username} logout={logout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
          </Routes>
        </div>
        {loggedIn && <NavBar />}
      </div>
    </Router>
  );
}

export default App;
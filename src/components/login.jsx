import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ authenticate }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (authenticate(username, password)) {
      navigate('/');
    } else {
      setError('Please enter both username and password');
    }
  };

  const handleCreateAccount = () => {
    // This would be implemented in a real app
    alert('Account creation would be implemented here');
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h1>Pain Tracker</h1>
        <h3>Please login</h3>
      </div>
      
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="button-group">
          <button type="submit" className="btn btn-primary">Login</button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleCreateAccount}
          >
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
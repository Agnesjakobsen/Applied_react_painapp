import React from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();

  return (
    <div className="profile-container">
      <h1 className="profile-heading">Profile</h1>
      <div className="profile-options">
        <button className="profile-button" onClick={() => navigate('/account')}>
          Account
        </button>
        <button className="profile-button" onClick={() => navigate('/notifications')}>
          Notifications
        </button>
        <button className="profile-button" onClick={() => navigate('/medication')}>
          Medication
        </button>
        <button className="profile-button" onClick={() => navigate('/settings')}>
          Settings
        </button>
        <button className="profile-button" onClick={() => navigate('/export')}>
          Export to Doctor
        </button>
      </div>
    </div>
  );
}

export default Profile;
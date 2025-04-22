import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, User, Bell, Pill, FileText } from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  
  return (
    <div className="profile-container">
      <h1 className="profile-heading">Profile</h1>
      
      <div className="profile-options">
        <button className="profile-button" onClick={() => navigate('/account')}>
          <div className="profile-button-content">
            <User className="profile-button-icon" />
            <span>Account</span>
          </div>
          <span className="profile-button-arrow">›</span>
        </button>
        
        <button className="profile-button" onClick={() => navigate('/notifications')}>
          <div className="profile-button-content">
            <Bell className="profile-button-icon" />
            <span>Notifications</span>
          </div>
          <span className="profile-button-arrow">›</span>
        </button>
        
        <button className="profile-button" onClick={() => navigate('/medication')}>
          <div className="profile-button-content">
            <Pill className="profile-button-icon" />
            <span>Medication</span>
          </div>
          <span className="profile-button-arrow">›</span>
        </button>
        
        <button className="profile-button" onClick={() => navigate('/settings')}>
          <div className="profile-button-content">
            <Settings className="profile-button-icon" />
            <span>Settings</span>
          </div>
          <span className="profile-button-arrow">›</span>
        </button>
        
        <button className="profile-button" onClick={() => navigate('/export')}>
          <div className="profile-button-content">
            <FileText className="profile-button-icon" />
            <span>Export to Doctor</span>
          </div>
          <span className="profile-button-arrow">›</span>
        </button>
      </div>
    </div>
  );
}

export default Profile;
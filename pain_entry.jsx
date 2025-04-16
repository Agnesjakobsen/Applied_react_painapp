import React, { useState } from 'react';
import { format } from 'date-fns';

function CreateEntry({ selectedDate }) {
  // State for form fields
  const [hasPain, setHasPain] = useState(null);
  const [painAreas, setPainAreas] = useState([]);
  const [worstPain, setWorstPain] = useState(null);
  const [leastPain, setLeastPain] = useState(null);
  const [averagePain, setAveragePain] = useState(null);
  const [currentPain, setCurrentPain] = useState(null);
  const [usingTreatment, setUsingTreatment] = useState(null);
  const [treatment, setTreatment] = useState('');
  const [treatmentRelief, setTreatmentRelief] = useState(null);
  const [generalActivity, setGeneralActivity] = useState(null);
  const [mood, setMood] = useState(null);
  const [walking, setWalking] = useState(null);
  const [normalWork, setNormalWork] = useState(null);
  const [relations, setRelations] = useState(null);
  const [sleep, setSleep] = useState(null);
  const [enjoyment, setEnjoyment] = useState(null);
  const [success, setSuccess] = useState(false);

  // Helper functions for options
  const getPainOptions = () => [
    "✅ 0 - No pain",
    "🟢 1",
    "🟢 2",
    "🟡 3",
    "🟡 4",
    "🟠 5",
    "🟠 6",
    "🟠 7",
    "🔴 8",
    "🔴 9",
    "🚫 10 - Worst imaginable pain"
  ];

  const getReliefOptions = () => [
    "✅ 100 % - Complete relief",
    "🟢 90 %",
    "🟢 80 %",
    "🟡 70 %",
    "🟡 60 %",
    "🟠 50 %",
    "🟠 40 %",
    "🟠 30 %",
    "🔴 20 %",
    "🔴 10 %",
    "🚫 0 % - No relief"
  ];

  const getInterferenceOptions = () => [
    "✅ 0 - Has not interfered",
    "🟢 1",
    "🟢 2",
    "🟡 3",
    "🟡 4",
    "🟠 5",
    "🟠 6",
    "🟠 7",
    "🔴 8",
    "🔴 9",
    "🚫 10 - Has interfered completely"
  ];

  // Extract number from string (e.g., "🟢 2" -> 2)
  const extractNumber = (value) => {
    if (typeof value === 'string') {
      const match = value.match(/\d+/);
      if (match) {
        return parseInt(match[0], 10);
      }
    }
    return value;
  };

  // Save the form data
  const saveSubmission = (data) => {
    // In a real app, this would send the data to a backend or store it locally
    console.log("Saving pain log:", data);
    
    // For this example, we'll store it in localStorage
    const existingData = JSON.parse(localStorage.getItem('painLog') || '[]');
    existingData.push(data);
    localStorage.setItem('painLog', JSON.stringify(existingData));
  };

  // Handle form submission for "No Pain"
  const handleNoPainSubmit = () => {
    const data = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      bpi1: "No",
      bpi3: 0,
      bpi4: 0,
      bpi5: 0,
      bpi6: 0,
      bpi7: "",
      bpi8: "0 %",
      bpi9a: 0,
      bpi9b: 0,
      bpi9c: 0,
      bpi9d: 0,
      bpi9e: 0,
      bpi9f: 0,
      bpi9g: 0,
    };
    saveSubmission(data);
    setSuccess(true);
  };

  // Handle form submission for pain data
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      bpi1: "Yes",
      bpi2: painAreas.join(', '),
      bpi3: extractNumber(worstPain),
      bpi4: extractNumber(leastPain),
      bpi5: extractNumber(averagePain),
      bpi6: extractNumber(currentPain),
      bpi7: treatment,
      bpi8: extractNumber(treatmentRelief),
      bpi9a: extractNumber(generalActivity),
      bpi9b: extractNumber(mood),
      bpi9c: extractNumber(walking),
      bpi9d: extractNumber(normalWork),
      bpi9e: extractNumber(relations),
      bpi9f: extractNumber(sleep),
      bpi9g: extractNumber(enjoyment),
    };
    
    saveSubmission(data);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="success-container">
        <div className="success-message">
          ✅ Your {hasPain === "No" ? "no-pain" : "pain"} report was submitted.
        </div>
        <button 
          onClick={() => setSuccess(false)}
          className="btn btn-primary"
        >
          Log Another Entry
        </button>
      </div>
    );
  }

  return (
    <div className="create-entry-container">
      <h1>🩺 Log your pain</h1>
      <div className="date-selector">
        <label>Date</label>
        <div>{format(selectedDate, 'EEEE, dd MMMM yyyy')}</div>
      </div>
      
      <hr />
      
      <div className="pain-question">
        <h3>Have you had any pain today other than minor everyday aches (like headaches or toothaches)?</h3>
        <div className="radio-group">
          <label>
            <input 
              type="radio" 
              name="hasPain" 
              value="No" 
              checked={hasPain === "No"}
              onChange={() => setHasPain("No")}
            />
            No
          </label>
          <label>
            <input 
              type="radio" 
              name="hasPain" 
              value="Yes" 
              checked={hasPain === "Yes"}
              onChange={() => setHasPain("Yes")}
            />
            Yes
          </label>
        </div>
      </div>
      
      {hasPain === "No" && (
        <div className="no-pain-section">
          <button 
            onClick={handleNoPainSubmit}
            className="btn btn-primary"
          >
            Submit no pain report
          </button>
        </div>
      )}
      
      {hasPain === "Yes" && (
        <form onSubmit={handleSubmit}>
          <div className="pain-area-section">
            <h3>Please select the area(s) of your body that hurt(s) the most</h3>
            <div className="checkbox-group">
              {["Head", "Neck", "Shoulder", "Arm", "Hand", "Back", "Chest", "Abdomen", "Hip", "Leg", "Foot"].map((area) => (
                <label key={area}>
                  <input 
                    type="checkbox" 
                    value={area}
                    checked={painAreas.includes(area)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPainAreas([...painAreas, area]);
                      } else {
                        setPainAreas(painAreas.filter(a => a !== area));
                      }
                    }}
                  />
                  {area}
                </label>
              ))}
            </div>
          </div>
          
          <div className="pain-ratings-section">
            <h3>Please rate your pain in the past 24 hours</h3>
            
            <div className="form-group">
              <label>Your pain at its worst</label>
              <select 
                value={worstPain || ''}
                onChange={(e) => setWorstPain(e.target.value)}
                required
              >
                <option value="">Select...</option>
                {getPainOptions().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Your pain at its least</label>
              <select 
                value={leastPain || ''}
                onChange={(e) => setLeastPain(e.target.value)}
                required
              >
                <option value="">Select...</option>
                {getPainOptions().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Your pain on average</label>
              <select 
                value={averagePain || ''}
                onChange={(e) => setAveragePain(e.target.value)}
                required
              >
                <option value="">Select...</option>
                {getPainOptions().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Your pain right now</label>
              <select 
                value={currentPain || ''}
                onChange={(e) => setCurrentPain(e.target.value)}
                required
              >
                <option value="">Select...</option>
                {getPainOptions().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          
          <hr />
          
          <div className="treatment-section">
            <h3>Are you using any treatments or meds for your pain?</h3>
            <div className="radio-group">
              <label>
                <input 
                  type="radio" 
                  name="usingTreatment" 
                  value="No" 
                  checked={usingTreatment === "No"}
                  onChange={() => setUsingTreatment("No")}
                />
                No
              </label>
              <label>
                <input 
                  type="radio" 
                  name="usingTreatment" 
                  value="Yes" 
                  checked={usingTreatment === "Yes"}
                  onChange={() => setUsingTreatment("Yes")}
                />
                Yes
              </label>
            </div>
            
            {usingTreatment === "Yes" && (
              <>
                <div className="form-group">
                  <label>What pain treatments or meds are you using?</label>
                  <input 
                    type="text" 
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    placeholder="e.g. paracetamol, physical therapy, meditation"
                    maxLength={100}
                  />
                </div>
                
                {treatment && (
                  <div className="form-group">
                    <label>How much relief have your pain treatments/meds given in the past 24 hours?</label>
                    <select 
                      value={treatmentRelief || ''}
                      onChange={(e) => setTreatmentRelief(e.target.value)}
                    >
                      <option value="">Select...</option>
                      {getReliefOptions().map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
          
          <hr />
          
          <div className="interference-section">
            <h3>In the past 24 hours, how much has pain interfered with your...</h3>
            
            <div className="form-group">
              <label>general activity?</label>
              <select 
                value={generalActivity || ''}
                onChange={(e) => setGeneralActivity(e.target.value)}
                required
              >
                <option value="">Select...</option>
                {getInterferenceOptions().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>mood?</label>
              <select 
                value={mood || ''}
                onChange={(e) => setMood(e.target.value)}
                required
              >
                <option value="">Select...</option>
                {getInterferenceOptions().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>walking?</label>
              <select 
                value={walking || ''}
                onChange={(e) => setWalking(e.target.value)}
                required
              >
                <option value="">Select...</option>
                {getInterferenceOptions().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>normal work (incl. housework)?</label>
              <select 
                value={normalWork || ''}
                onChange={(e) => setNormalWork(e.target.value)}
                required
              >
                <option value="">Select...</option>
                {getInterferenceOptions().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>relations with other people?</label>
              <select 
                value={relations || ''}
                onChange={(e) => setRelations(e.target.value)}
                required
              >
                <option value="">Select...</option>
                {getInterferenceOptions().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>sleep?</label>
              <select 
                value={sleep || ''}
                onChange={(e) => setSleep(e.target.value)}
                required
              >
                <option value="">Select...</option>
                {getInterferenceOptions().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>enjoyment of life?</label>
              <select 
                value={enjoyment || ''}
                onChange={(e) => setEnjoyment(e.target.value)}
                required
              >
                <option value="">Select...</option>
                {getInterferenceOptions().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          
          <hr />
          
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>
      )}
    </div>
  );
}

export default CreateEntry;
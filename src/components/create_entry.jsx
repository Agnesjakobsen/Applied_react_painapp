import React, { useState } from "react";
import { format } from "date-fns";
import { supabase } from "../utils/supabase";

export default function CreateEntry({ selectedDate }) {
  const [form, setForm] = useState({
    hasPain: null,
    painAreas: [],
    worstPain: null,
    leastPain: null,
    averagePain: null,
    currentPain: null,
    usingTreatment: null,
    treatment: "",
    treatmentRelief: null,
    generalActivity: null,
    mood: null,
    walking: null,
    normalWork: null,
    relations: null,
    sleep: null,
    enjoyment: null,
  });

  const [success, setSuccess] = useState(false);

  const painScale = [0,1,2,3,4,5,6,7,8,9,10];
  const reliefScale = [0,10,20,30,40,50,60,70,80,90,100];

  // Save the form data to Supabase
  const handleSave = async () => {
    const data = {
      date: format(selectedDate, "yyyy-MM-dd"),
      bpi1: form.hasPain || null,
      bpi2: form.painAreas.length > 0 ? form.painAreas.join(", ") : null,
      bpi3: form.worstPain,
      bpi4: form.leastPain,
      bpi5: form.averagePain,
      bpi6: form.currentPain,
      bpi7: form.treatment || null,
      bpi8: form.treatmentRelief,
      bpi9a: form.generalActivity,
      bpi9b: form.mood,
      bpi9c: form.walking,
      bpi9d: form.normalWork,
      bpi9e: form.relations,
      bpi9f: form.sleep,
      bpi9g: form.enjoyment,
    };

    const { error } = await supabase.from("pain_entries").insert(data);
    if (error) {
      console.error(error);
      alert("Error saving. Please try again.");
    } else {
      setSuccess(true);
    }
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (success) {
    return (
      <div className="success-container">
        <p className="success-message">✅ Entry saved!</p>
        <button onClick={() => setSuccess(false)} className="button-primary">
          Log Another
        </button>
      </div>
    );
  }

  return (
    <div className="entry-container">
      <h1 className="entry-title">Create entry</h1>

      <div className="question-section">
        <h2 className="question-title">Did you have any pain today?</h2>
        <div className="button-group">
          <button onClick={() => updateField("hasPain", "No")} className={`button-option ${form.hasPain === "No" ? "active" : ""}`}>No</button>
          <button onClick={() => updateField("hasPain", "Yes")} className={`button-option ${form.hasPain === "Yes" ? "active" : ""}`}>Yes</button>
        </div>
      </div>

      {form.hasPain === "Yes" && (
        <>
          <div className="question-section">
            <h2 className="question-title">Where did it hurt?</h2>
            <div className="button-grid">
              {["Head", "Neck", "Shoulder", "Arm", "Hand", "Back", "Chest", "Abdomen", "Hip", "Leg", "Foot"].map((area) => (
                <button
                  key={area}
                  onClick={() =>
                    updateField("painAreas", form.painAreas.includes(area)
                      ? form.painAreas.filter(a => a !== area)
                      : [...form.painAreas, area]
                    )
                  }
                  className={`button-small ${form.painAreas.includes(area) ? "active" : ""}`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div className="question-section">
            <h2 className="question-title">Rate your pain (0-10)</h2>
            
            {["worstPain", "leastPain", "averagePain", "currentPain"].map((field) => (
              <div key={field} className="pain-scale-container">
                <div className="field-label">{field.replace(/([A-Z])/g, ' $1')}</div>
                <div className="pain-scale">
                  {painScale.map((n) => (
                    <button
                      key={n}
                      onClick={() => updateField(field, n)}
                      className={`pain-scale-button pain-${n} ${form[field] === n ? "active" : ""}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>


          <div className="question-section">
            <h2 className="question-title">Are you using any treatment?</h2>
            <div className="button-group">
              <button onClick={() => updateField("usingTreatment", "No")} className={`button-option ${form.usingTreatment === "No" ? "active" : ""}`}>No</button>
              <button onClick={() => updateField("usingTreatment", "Yes")} className={`button-option ${form.usingTreatment === "Yes" ? "active" : ""}`}>Yes</button>
            </div>

            {form.usingTreatment === "Yes" && (
              <>
                <input
                  type="text"
                  value={form.treatment}
                  onChange={(e) => updateField("treatment", e.target.value)}
                  placeholder="E.g., paracetamol"
                  className="input-field"
                />
                <div>
                  <div className="field-label">Relief (%)</div>
                  <div className="button-scroll">
                    {reliefScale.map((n) => (
                      <button
                        key={n}
                        onClick={() => updateField("treatmentRelief", n)}
                        className={`pain-scale-button pain-${Math.floor(n / 10)} ${form.treatmentRelief === n ? "active" : ""}`}
                      >
                        {n}%
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="question-section">
            <h2 className="question-title">Pain interfering with...</h2>
            {["generalActivity", "mood", "walking", "normalWork", "relations", "sleep", "enjoyment"].map((field) => (
              <div key={field} className="pain-scale-container">
                <div className="field-label">{field.replace(/([A-Z])/g, ' $1')}</div>
                <div className="pain-scale">
                  {painScale.map((n) => (
                    <button
                      key={n}
                      onClick={() => updateField(field, n)}
                      className={`pain-scale-button pain-${n} ${form[field] === n ? "active" : ""}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="save-section">
        <button
          onClick={handleSave}
          className="button-primary"
        >
          Save Entry
        </button>
      </div>
    </div>
  );
}

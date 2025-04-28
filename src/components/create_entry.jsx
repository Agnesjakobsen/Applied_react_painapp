import React, { useState } from "react";
import { format } from "date-fns";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";

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

  const painScale = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const reliefScale = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  // Use the useNavigate hook to navigate
  const navigate = useNavigate();

  // Save the form data to Supabase
  const handleSave = async () => {
    const noPain = form.hasPain === "No";

    const data = {
      date: format(selectedDate, "yyyy-MM-dd"),
      bpi1: form.hasPain || null,
      bpi2: noPain
        ? ""
        : form.painAreas.length > 0
        ? form.painAreas.join(", ")
        : null,
      bpi3: noPain ? 0 : form.worstPain,
      bpi4: noPain ? 0 : form.leastPain,
      bpi5: noPain ? 0 : form.averagePain,
      bpi6: noPain ? 0 : form.currentPain,
      bpi7: noPain ? "" : form.treatment || null,
      bpi8: noPain ? 0 : form.treatmentRelief,
      bpi9a: noPain ? 0 : form.generalActivity,
      bpi9b: noPain ? 0 : form.mood,
      bpi9c: noPain ? 0 : form.walking,
      bpi9d: noPain ? 0 : form.normalWork,
      bpi9e: noPain ? 0 : form.relations,
      bpi9f: noPain ? 0 : form.sleep,
      bpi9g: noPain ? 0 : form.enjoyment,
    };

    const { error } = await supabase.from("pain_entries").insert(data);
    if (error) {
      console.error(error);
      alert("Error saving. Please try again.");
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 5000);
    }
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (success) {
    return (
      <div className="success-container">
        <p className="success-message">✅ Entry saved!</p>
        <p className="success-submessage">Going back to the home page...</p>
      </div>
    );
  }

  return (
    <div className="entry-container">
      <h1 className="entry-title">Create entry</h1>

      <div className="question-section">
        <h2 className="question-title">
          Have you had any pain today other than minor everyday aches (like
          headaches or toothaches)?
        </h2>
        <div className="button-group-centered">
          <button
            onClick={() => updateField("hasPain", "No")}
            className={`button-option ${form.hasPain === "No" ? "active" : ""}`}
          >
            No
          </button>
          <button
            onClick={() => updateField("hasPain", "Yes")}
            className={`button-option ${
              form.hasPain === "Yes" ? "active" : ""
            }`}
          >
            Yes
          </button>
        </div>
      </div>

      {form.hasPain === "Yes" && (
        <>
          <div className="question-section">
            <h2 className="question-title">Which area(s) hurt(s) the most?</h2>
            <div className="button-grid">
              {[
                "Head",
                "Neck",
                "Shoulder",
                "Arm",
                "Hand",
                "Back",
                "Chest",
                "Abdomen",
                "Hip",
                "Leg",
                "Foot",
              ].map((area) => (
                <button
                  key={area}
                  onClick={() =>
                    updateField(
                      "painAreas",
                      form.painAreas.includes(area)
                        ? form.painAreas.filter((a) => a !== area)
                        : [...form.painAreas, area]
                    )
                  }
                  className={`button-small ${
                    form.painAreas.includes(area) ? "active" : ""
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div className="question-section">
            <h2 className="question-title">
              Rate your pain in the past 24 hours
            </h2>

            {["worstPain", "leastPain", "averagePain", "currentPain"].map(
              (field) => (
                <div key={field} className="pain-scale-container">
                  <div className="field-label">
                    {field.replace(/([A-Z])/g, " $1")}
                  </div>
                  <div className="pain-scale">
                    {painScale.map((n) => (
                      <button
                        key={n}
                        onClick={() => updateField(field, n)}
                        className={`pain-scale-button pain-${n} ${
                          form[field] === n ? "active" : ""
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="question-section">
            <h2 className="question-title">
              Are you using any treatments or meds for your pain?
            </h2>
            <div className="button-group-centered">
              <button
                onClick={() => updateField("usingTreatment", "No")}
                className={`button-option ${
                  form.usingTreatment === "No" ? "active" : ""
                }`}
              >
                No
              </button>
              <button
                onClick={() => updateField("usingTreatment", "Yes")}
                className={`button-option ${
                  form.usingTreatment === "Yes" ? "active" : ""
                }`}
              >
                Yes
              </button>
            </div>

            {form.usingTreatment === "Yes" && (
              <>
                <input
                  type="text"
                  value={form.treatment}
                  onChange={(e) => updateField("treatment", e.target.value)}
                  placeholder="E.g., paracetamol, yoga"
                  className="input-field"
                />
                <div>
                  <div className="field-label">
                    How much relief has this given you in the past 24 hours?
                  </div>
                  <div className="button-scroll">
                    {reliefScale.map((n) => (
                      <button
                        key={n}
                        onClick={() => updateField("treatmentRelief", n)}
                        className={`pain-scale-button pain-${Math.floor(
                          n / 10
                        )} ${form.treatmentRelief === n ? "active" : ""}`}
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
            <h2 className="question-title">
              In the past 24 hours, how much has pain interfered with your . . .
            </h2>
            {[
              "generalActivity",
              "mood",
              "walking",
              "normalWork",
              "relations",
              "sleep",
              "enjoyment",
            ].map((field) => (
              <div key={field} className="pain-scale-container">
                <div className="field-label">
                  {field.replace(/([A-Z])/g, " $1")}
                </div>
                <div className="pain-scale">
                  {painScale.map((n) => (
                    <button
                      key={n}
                      onClick={() => updateField(field, n)}
                      className={`pain-scale-button pain-${n} ${
                        form[field] === n ? "active" : ""
                      }`}
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

      {form.hasPain && (
        <div className="save-section-fixed">
          <button onClick={handleSave} className="button-primary">
            Save Entry
          </button>
        </div>
      )}
    </div>
  );
}

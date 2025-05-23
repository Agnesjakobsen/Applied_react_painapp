import React, { useState, useEffect } from "react";
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
  const [svgContent, setSvgContent] = useState("");

  const painScale = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const navigate = useNavigate();

  // Body map areas - grouped left/right parts
  const svgArea = {
    head: "Head",
    head_2: "Head",
    neck: "Neck",
    neck_2: "Neck",
    "left-shoulder": "Shoulder",
    "left-shoulder_2": "Shoulder",
    "right-shoulder": "Shoulder",
    "right-shoulder_2": "Shoulder",
    chest: "Chest",
    chest_2: "Chest",
    abdomen: "Abdomen",
    abdomen_2: "Abdomen",
    "left-hip": "Hip",
    "left-hip_2": "Hip",
    "right-hip": "Hip",
    "right-hip_2": "Hip",
    "left-arm": "Arm",
    "left-arm_2": "Arm",
    "right-arm": "Arm",
    "right-arm 2": "Arm",
    "left-hand": "Hand",
    "left-hand_2": "Hand",
    "right-hand": "Hand",
    "right-hand_2": "Hand",
    "left-leg": "Leg",
    "left-leg_2": "Leg",
    "right-leg": "Leg",
    "right-leg_2": "Leg",
    "left-knee": "Knee",
    "left-knee_2": "Knee",
    "right-knee": "Knee",
    "right-knee_2": "Knee",
    "left-foot": "Foot",
    "left-foot_2": "Foot",
    "right-foot": "Foot",
    "right-foot_2": "Foot",
  };

  const areaToSvg = {};
  Object.entries(svgArea).forEach(([svgId, areaName]) => {
    if (!areaToSvg[areaName]) {
      areaToSvg[areaName] = [];
    }
    areaToSvg[areaName].push(svgId);
  });

  const togglePainArea = (area) => {
    setForm((prev) => ({
      ...prev,
      painAreas: prev.painAreas.includes(area)
        ? prev.painAreas.filter((a) => a !== area)
        : [...prev.painAreas, area],
    }));
  };

  // Load SVG content
  useEffect(() => {
    const loadSvg = async () => {
      try {
        const response = await fetch('/assets/bodymap.svg');
        if (response.ok) {
          const svgText = await response.text();
          setSvgContent(svgText);
        }
      } catch (error) {
        console.error('Error loading SVG:', error);
      }
    };
    loadSvg();
  }, []);

  // Highlight selected SVG areas
  useEffect(() => {
    const SvgHighlighting = () => {
      const svgElements = document.querySelectorAll(".bodymap-svg [id]");
      svgElements.forEach((el) => {
        el.classList.remove("svg-area-active");
      });
      form.painAreas.forEach((area) => {
        const svgIds = areaToSvg[area];
        if (svgIds) {
          svgIds.forEach(svgId => {
            const el = document.querySelector(`.bodymap-svg [id="${svgId}"]`);
            if (el) {
              el.classList.add("svg-area-active");
            }
          });
        }
      });
    };
    SvgHighlighting();
    const timeout = setTimeout(SvgHighlighting, 100);
    return () => clearTimeout(timeout);
  }, [form.painAreas, areaToSvg]);

  const handleSvgClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let target = e.target;
    while (target && !target.id && target !== e.currentTarget) {
      target = target.parentNode;
    }
    if (target && target.id && svgArea[target.id]) {
      togglePainArea(svgArea[target.id]);
    }
  };

  const handleBodyPartClick = (id) => {
    const area = svgArea[id];
    if (!area) return;
    togglePainArea(area);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isAreaActive = (area) => form.painAreas.includes(area);

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

  return (
    <div className="entry-container">
      <h1 className="entry-title">Create Entry</h1>

      <div className="question-section">
        <h2 className="question-title">
          Have you had any pain today other than minor everyday aches?
        </h2>
        <p>(like headaches or toothaches)</p>
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
            <h2 className="question-title">Mark where it hurts most</h2>
            <div className="bodymap-container">
              {svgContent ? (
                <div 
                  className="bodymap-svg"
                  onClick={handleSvgClick}
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              ) : (
                <div className="bodymap-svg" style={{
                  width: '275px',
                  height: '400px',
                  border: '2px dashed #ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666'
                }}>
                  Loading body map...
                </div>
              )}
            </div>
            <div className="button-grid">
              {[...new Set(Object.values(svgArea)), "Back"].map((area) => (
                <button
                  key={area}
                  onClick={() => togglePainArea(area)}
                  className={`button-small ${isAreaActive(area) ? "active" : ""}`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div className="question-section">
            <h2 className="question-title">Rate your pain today</h2>
            {["worstPain", "leastPain", "averagePain", "currentPain"].map(
              (field) => (
                <div key={field} className="pain-scale-container">
                  <div className="field-label">
                    {field
                      .replace(/([A-Z])/g, " $1")
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
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
              Any pain treatments or medications used today?
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
                <div className="treatment-options">
                  {[
                    "Paracetamol",
                    "Ibuprofen",
                    "Stretching",
                    "Heat Pad",
                    "Yoga",
                  ].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`button-small${
                        form.treatment === option ? " active" : ""
                      }`}
                      onClick={() => updateField("treatment", option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={form.treatmentOther || ""}
                  onChange={(e) =>
                    updateField("treatmentOther", e.target.value)
                  }
                  placeholder="Other (optional)"
                  className="input-field"
                />
                <div className="pain-scale-container">
                  <div className="field-label">
                    How much relief has this given you today?
                  </div>
                  <div className="pain-scale">
                    {painScale.map((n) => (
                      <button
                        key={n}
                        onClick={() => updateField("treatmentRelief", n)}
                        className={`pain-scale-button pain-${n} ${
                          form.treatmentRelief === n ? "active" : ""
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="question-section">
            <h2 className="question-title">
              How much did pain interfere today with
            </h2>
            {[
              "GeneralActivity",
              "Mood",
              "Walking",
              "Normal Work",
              "Relations",
              "Sleep",
              "Enjoyment",
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
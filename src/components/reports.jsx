import React, { useState, useEffect } from "react";
import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
} from "recharts";
import { format, subDays, subMonths, subYears, parseISO } from "date-fns";
import { supabase } from "../utils/supabase";
import { AlertCircle } from "lucide-react";

function Reports() {
  const [painData, setPainData] = useState([]);
  const [rangeOption, setRangeOption] = useState("Last 7 days");
  const [filteredData, setFilteredData] = useState([]);
  const [averagePain, setAveragePain] = useState(0);
  const [mostPainfulArea, setMostPainfulArea] = useState("None");
  const [previousAveragePain, setPreviousAveragePain] = useState(0);
  const [previousMostPainfulArea, setPreviousMostPainfulArea] =
    useState("None");

  // Load data from localStorage
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("pain_entries")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.error("Error loading data from Supabase:", error);
      } else {
        const processedData = data.map((entry) => ({
          ...entry,
          date: parseISO(entry.date),
        }));
        setPainData(processedData);
      }
    };

    fetchData();
  }, []);

  // Filter data based on selected range
  useEffect(() => {
    if (painData.length === 0) return;

    const today = new Date();
    let cutoffDate;

    switch (rangeOption) {
      case "Last 7 days":
        cutoffDate = subDays(today, 7);
        break;
      case "Last month":
        cutoffDate = subMonths(today, 1);
        break;
      case "Last year":
        cutoffDate = subYears(today, 1);
        break;
      default: // All time
        cutoffDate = new Date(0); // earliest possible date
    }

    const filtered = painData.filter((entry) => entry.date >= cutoffDate);
    setFilteredData(filtered);

    // Calculate metrics for current period
    if (filtered.length > 0) {
      // Average pain
      const avgPain =
        filtered.reduce((sum, entry) => sum + entry.bpi5, 0) / filtered.length;
      setAveragePain(avgPain);

      // Most painful area
      const areaCounts = {};
      filtered.forEach((entry) => {
        if (entry.bpi2) {
          entry.bpi2.split(", ").forEach((area) => {
            areaCounts[area] = (areaCounts[area] || 0) + 1;
          });
        }
      });

      let maxCount = 0;
      let maxArea = "None";

      Object.entries(areaCounts).forEach(([area, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxArea = area;
        }
      });

      setMostPainfulArea(maxArea);
    }

    // Calculate metrics for previous period
    const previousCutoffStart = (() => {
      switch (rangeOption) {
        case "Last 7 days":
          return subDays(cutoffDate, 7);
        case "Last month":
          return subMonths(cutoffDate, 1);
        case "Last year":
          return subYears(cutoffDate, 1);
        default:
          return null;
      }
    })();

    if (previousCutoffStart) {
      const previousFiltered = painData.filter(
        (entry) => entry.date >= previousCutoffStart && entry.date < cutoffDate
      );

      if (previousFiltered.length > 0) {
        // Previous average pain
        const prevAvgPain =
          previousFiltered.reduce((sum, entry) => sum + entry.bpi5, 0) /
          previousFiltered.length;
        setPreviousAveragePain(prevAvgPain);

        // Previous most painful area
        const prevAreaCounts = {};
        previousFiltered.forEach((entry) => {
          if (entry.bpi2) {
            entry.bpi2.split(", ").forEach((area) => {
              prevAreaCounts[area] = (prevAreaCounts[area] || 0) + 1;
            });
          }
        });

        let prevMaxCount = 0;
        let prevMaxArea = "None";

        Object.entries(prevAreaCounts).forEach(([area, count]) => {
          if (count > prevMaxCount) {
            prevMaxCount = count;
            prevMaxArea = area;
          }
        });

        setPreviousMostPainfulArea(prevMaxArea);
      }
    }
  }, [painData, rangeOption]);

  // Prepare chart data
  const prepareChartData = () => {
    // Group by day/week/month based on range
    const groupedData = {};

    filteredData.forEach((entry) => {
      let periodKey;

      switch (rangeOption) {
        case "Last 7 days":
          periodKey = format(entry.date, "yyyy-MM-dd");
          break;
        case "Last month":
          periodKey = format(entry.date, "yyyy-MM-w"); // Week-based grouping
          break;
        case "Last year":
        case "All time":
          periodKey = format(entry.date, "yyyy-MM"); // Month-based grouping
          break;
        default:
          periodKey = format(entry.date, "yyyy-MM-dd");
      }

      if (!groupedData[periodKey]) {
        groupedData[periodKey] = {
          period: periodKey,
          date: new Date(entry.date),
          bpi3Count: 0, // Worst pain count
          bpi4Count: 0, // Least pain count
          bpi5Count: 0, // Average pain count
          bpi3Sum: 0,
          bpi4Sum: 0,
          bpi5Sum: 0,
        };
      }

      // Sum up pain values for averaging later
      if (typeof entry.bpi3 === "number") {
        groupedData[periodKey].bpi3Sum += entry.bpi3;
        groupedData[periodKey].bpi3Count++;
      }

      if (typeof entry.bpi4 === "number") {
        groupedData[periodKey].bpi4Sum += entry.bpi4;
        groupedData[periodKey].bpi4Count++;
      }

      if (typeof entry.bpi5 === "number") {
        groupedData[periodKey].bpi5Sum += entry.bpi5;
        groupedData[periodKey].bpi5Count++;
      }
    });

    // Calculate averages and format dates
    return Object.values(groupedData)
      .map((group) => ({
        period: group.period,
        date: group.date,
        // Calculate averages, default to 0 if no data
        bpi3: group.bpi3Count > 0 ? group.bpi3Sum / group.bpi3Count : null, // Worst
        bpi4: group.bpi4Count > 0 ? group.bpi4Sum / group.bpi4Count : null, // Least
        bpi5: group.bpi5Count > 0 ? group.bpi5Sum / group.bpi5Count : null, // Average
      }))
      .sort((a, b) => a.date - b.date); // Sort by date ascending
  };

  // Prepare interference data
  const prepareInterferenceData = () => {
    if (filteredData.length === 0) return [];

    const interferenceCols = [
      "bpi9a",
      "bpi9b",
      "bpi9c",
      "bpi9d",
      "bpi9e",
      "bpi9f",
      "bpi9g",
    ];
    const labels = {
      bpi9a: "General Activity",
      bpi9b: "Mood",
      bpi9c: "Walking",
      bpi9d: "Normal Work",
      bpi9e: "Relations",
      bpi9f: "Sleep",
      bpi9g: "Enjoyment of Life",
    };

    const data = interferenceCols.map((col) => {
      const values = filteredData
        .filter((entry) => typeof entry[col] === "number")
        .map((entry) => entry[col]);

      const average =
        values.length > 0
          ? values.reduce((sum, value) => sum + value, 0) / values.length
          : 0;

      return {
        factor: labels[col],
        score: average,
      };
    });

    return data;
  };

  // Prepare treatment comparison data
  const prepareTreatmentData = () => {
    if (filteredData.length === 0) return [];

    const treatmentGroups = {};

    filteredData.forEach((entry) => {
      const treatment = entry.bpi7 || "None";

      if (!treatmentGroups[treatment]) {
        treatmentGroups[treatment] = {
          treatment,
          painScores: [],
        };
      }

      if (typeof entry.bpi5 === "number") {
        treatmentGroups[treatment].painScores.push(entry.bpi5);
      }
    });

    return Object.values(treatmentGroups)
      .map((group) => ({
        treatment: group.treatment,
        averagePain:
          group.painScores.length > 0
            ? group.painScores.reduce((sum, score) => sum + score, 0) /
              group.painScores.length
            : 0,
      }))
      .sort((a, b) => a.averagePain - b.averagePain); // Sort by pain score
  };

  const chartData = prepareChartData();
  const interferenceData = prepareInterferenceData();
  const treatmentData = prepareTreatmentData();

  // Calculate pain score delta for display
  const painDelta = averagePain - previousAveragePain;
  const painDeltaDisplay = isNaN(painDelta) ? "N/A" : painDelta.toFixed(2);

  // Calculate area delta for display
  const areaDelta =
    mostPainfulArea !== previousMostPainfulArea &&
    previousMostPainfulArea !== "None"
      ? `was ${previousMostPainfulArea}`
      : "No change";

  // Choose period type for display
  const getPeriodType = () => {
    switch (rangeOption) {
      case "Last 7 days":
        return "Weekly";
      case "Last month":
        return "Monthly";
      case "Last year":
        return "Yearly";
      default:
        return "All Time";
    }
  };

  const periodType = getPeriodType();

  // Date format for x-axis based on range
  const getDateTickFormat = () => {
    switch (rangeOption) {
      case "Last 7 days":
        return (date) => format(date, "MM/dd");
      case "Last month":
        return (date) => format(date, "w"); // Week number
      case "Last year":
      case "All time":
        return (date) => format(date, "MMM"); // Month abbreviation
      default:
        return (date) => format(date, "MM/dd");
    }
  };

  return (
    <div className="main-content">
      <h1>Your Pain Report</h1>

      {painData.length === 0 ? (
        <div className="warning">
          <AlertCircle size={20} className="icon warning-icon" />
          No data found. Please create an entry first.
        </div>
      ) : (
        <>
          <div className="range-selector">
            <h3>Select time range</h3>
            <div className="range-options">
              {["Last 7 days", "Last month", "Last year", "All time"].map(
                (option) => (
                  <button
                    key={option}
                    className={rangeOption === option ? "selected" : ""}
                    onClick={() => setRangeOption(option)}
                  >
                    {option}
                  </button>
                )
              )}
            </div>
          </div>

          <hr />

          <section className="metrics-section">
            <h2>{periodType} Comparison</h2>

            <div className="metrics-container">
              <div className="metric-card">
                <h3>Average Pain Score</h3>
                <div className="metric-value">
                  {!isNaN(averagePain) ? averagePain.toFixed(2) : "No data"}
                </div>
                <div
                  className={`metric-delta ${
                    painDelta < 0 ? "positive" : painDelta > 0 ? "negative" : ""
                  }`}
                >
                  {painDeltaDisplay !== "N/A"
                    ? (painDelta > 0 ? "+" : "") + painDeltaDisplay
                    : "N/A"}
                </div>
              </div>

              <div className="metric-card">
                <h3>Most Painful Area</h3>
                <div className="metric-value">
                  {mostPainfulArea || "No data"}
                </div>
                <div className="metric-delta">{areaDelta}</div>
              </div>
            </div>
          </section>

          <hr />

          <section className="trends-section">
            <h2>{periodType} Trends</h2>

            {chartData.length === 0 ? (
              <div className="no-data">No data available for this range</div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={getDateTickFormat()}
                    type="category"
                  />
                  <YAxis domain={[0, 10]} />
                  <Tooltip
                    formatter={(value) => value.toFixed(2)}
                    labelFormatter={(label) =>
                      format(new Date(label), "MMM dd, yyyy")
                    }
                    contentStyle={{
                      backgroundColor: "var(--primary-container-color)",
                      color: "var(--text-color)",
                      border:
                        "var(--border-thickness) solid var(--border-color)",
                      borderRadius: "var(--border-radius)",
                      padding: "10px",
                    }}
                  />
                  <Legend
                    payload={[
                      { value: "Worst", type: "line", color: "#dc3545" },
                      { value: "Least", type: "line", color: "#28a745" },
                      { value: "Average", type: "line", color: "#699494" },
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="bpi3"
                    name="Worst"
                    stroke="#dc3545"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    dot={rangeOption === "Last 7 days"}
                    opacity={0.8}
                  />
                  <Line
                    type="monotone"
                    dataKey="bpi4"
                    name="Least"
                    stroke="#28a745"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    dot={rangeOption === "Last 7 days"}
                    opacity={0.8}
                  />
                  <Line
                    type="monotone"
                    dataKey="bpi5"
                    name="Average"
                    stroke="#699494"
                    strokeWidth={2}
                    dot={rangeOption === "Last 7 days"}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </section>

          <hr />

          <section className="interference-section">
            <h2>{periodType} Pain Interference</h2>

            {interferenceData.length === 0 ? (
              <div className="no-data">No data available for this range</div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={interferenceData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 10]} />
                  <YAxis dataKey="factor" type="category" />
                  <Tooltip
                    formatter={(value) => [value.toFixed(2), "Score"]}
                    contentStyle={{
                      backgroundColor: "var(--primary-container-color)",
                      color: "var(--text-color)",
                      border:
                        "var(--border-thickness) solid var(--border-color)",
                      borderRadius: "var(--border-radius)",
                      padding: "10px",
                    }}
                  />
                  <Bar dataKey="score" fill="#699494" radius={[0, 4, 4, 0]}>
                    {interferenceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#699494" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          <hr />

          <section>
            <h2>Treatment Comparison</h2>

            {treatmentData.length === 0 ? (
              <div className="no-data">No data available for this range</div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={treatmentData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 10]} />
                  <YAxis dataKey="treatment" type="category" />
                  <Tooltip
                    formatter={(value) => [
                      value.toFixed(2),
                      "Average Pain Score",
                    ]}
                    contentStyle={{
                      backgroundColor: "var(--primary-container-color)",
                      color: "var(--text-color)",
                      border:
                        "var(--border-thickness) solid var(--border-color)",
                      borderRadius: "var(--border-radius)",
                      padding: "10px",
                    }}
                  />{" "}
                  <Bar
                    dataKey="averagePain"
                    fill="#699494"
                    radius={[0, 4, 4, 0]}
                  >
                    {treatmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#699494" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            <details className="treatment-explanation">
              <summary>How do I compare treatments?</summary>
              <p>
                <br />
                This chart shows the <strong>average pain</strong> on days you
                used a treatment. It does <em>not</em> mean that the treatment{" "}
                <em>causes</em> more or less pain!
                <br />
                <br />
                For example, if you only take painkillers when your pain is
                high, the chart may show high pain on those days. This just
                means that you tend to take painkillers <em>only</em> on bad
                days. It does <em>not</em> that they cause more pain.
              </p>
            </details>
          </section>
        </>
      )}
    </div>
  );
}

export default Reports;

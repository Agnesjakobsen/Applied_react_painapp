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

    let periodStart, periodEnd;
    const today = new Date();

    switch (rangeOption) {
      case "Last 7 days":
        periodEnd = today;
        periodStart = subDays(today, 7);
        break;
      case "Last month":
        periodEnd = today;
        periodStart = subMonths(today, 1);
        break;
      case "Last year":
        periodEnd = today;
        periodStart = subYears(today, 1);
        break;
      default: // All time
        periodEnd = today;
        periodStart = new Date(0);
    }

    // Filter current period
    const filtered = painData.filter(
      (entry) => entry.date >= periodStart && entry.date < periodEnd
    );
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
    const isAllTime = rangeOption === "All time";
    const duration = isAllTime ? null : periodEnd - periodStart;
    const prevPeriodEnd = periodStart;

    let previousFiltered = [];
    if (!isAllTime && duration !== null) {
      const prevPeriodEnd = periodStart;
      const prevPeriodStart = new Date(prevPeriodEnd - duration);

      previousFiltered = painData.filter(
        (entry) => entry.date >= prevPeriodStart && entry.date < prevPeriodEnd
      );
    }

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
    } else if (isAllTime) {
      setPreviousAveragePain(null);
      setPreviousMostPainfulArea("None");
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

  const getPeriodType_summary = () => {
    switch (rangeOption) {
      case "Last 7 days":
        return "week";
      case "Last month":
        return "month";
      case "Last year":
        return "year";
      default:
        return "All Time";
    }
  };

  const periodType_summary = getPeriodType_summary();

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
    <div className="reports-section">
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
                  <h3>
                    Average Pain Score
                    <span
                      className="tooltip"
                      title="The average reported pain level during the selected period."
                    ></span>
                  </h3>

                  <div className="metric-value">{averagePain.toFixed(2)}</div>

                  <div className="metric-subtext">
                    Last {getPeriodType_summary().toLowerCase()}:
                  </div>

                  <div
                    className={`metric-delta ${
                      previousAveragePain == null
                        ? "neutral"
                        : painDelta < 0
                        ? "positive"
                        : painDelta > 0
                        ? "negative"
                        : ""
                    }`}
                  >
                    {previousAveragePain != null
                      ? (painDelta > 0 ? "▲" : painDelta < 0 ? "▼" : "") +
                        Math.abs(painDeltaDisplay)
                      : "No comparison available"}
                  </div>
                </div>

                <div className={`metric-card`}>
                  <h3>
                    Most Painful Area
                    <span
                      className="tooltip"
                      title="The body area with the highest reported pain during the selected period."
                    ></span>
                  </h3>
                  <div className="metric-value">
                    {mostPainfulArea || "No data"}
                  </div>
                  <div className="metric-subtext">
                    Last {getPeriodType_summary().toLowerCase()}:
                  </div>
                  {previousMostPainfulArea &&
                  previousMostPainfulArea !== "None" ? (
                    <div className={`metric-delta ${"neutral"}`}>
                      {mostPainfulArea !== previousMostPainfulArea
                        ? `Changed from ${previousMostPainfulArea.toLowerCase()}`
                        : "No change"}
                    </div>
                  ) : (
                    <div className="metric-delta neutral">No previous data</div>
                  )}
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
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={getDateTickFormat()}
                      type="category"
                    />
                    <YAxis domain={[0, 10]} />
                    <Tooltip
                      formatter={(value, name) => [
                        value.toFixed(2),
                        name === "bpi3"
                          ? "Worst"
                          : name === "bpi4"
                          ? "Least"
                          : "Average",
                      ]}
                      labelFormatter={(label) =>
                        format(new Date(label), "MMM dd, yyyy")
                      }
                    />
                    <Legend
                      payload={[
                        {
                          value: "Worst",
                          type: "line",
                          color: "var(--metric-color-negative)",
                        },
                        {
                          value: "Least",
                          type: "line",
                          color: "var(--metric-color-positive)",
                        },
                        { value: "Average", type: "line", color: "#4D6D89" },
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="bpi3"
                      name="Worst"
                      stroke="var(--metric-color-negative)"
                      strokeDasharray="6 6"
                      strokeWidth={1.5}
                      dot={rangeOption === "Last 7 days"}
                      opacity={0.8}
                    />
                    <Line
                      type="monotone"
                      dataKey="bpi4"
                      name="Least"
                      stroke="var(--metric-color-positive)"
                      strokeDasharray="6 6"
                      strokeWidth={1.5}
                      dot={rangeOption === "Last 7 days"}
                      opacity={0.8}
                    />
                    <Line
                      type="monotone"
                      dataKey="bpi5"
                      name="Average"
                      stroke="#4D6D89"
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
                    />
                    <Bar dataKey="score" fill="#4D6D89" barSize={30}>
                      {interferenceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill="var(--primary-color)"
                        />
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
                    <YAxis
                      dataKey="treatment"
                      type="category"
                      interval={0} // <-- Ensures all labels are shown
                    />
                    <Tooltip
                      formatter={(value) => [
                        value.toFixed(2),
                        "Average Pain Score",
                      ]}
                    />
                    <Bar dataKey="averagePain" fill="#5A7D9A" barSize={30}>
                      {treatmentData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill="var(--primary-color)"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              <details className="treatment-explanation">
                <summary>How to interpret treatment comparisons</summary>
                <p>
                  This chart shows the average pain on days you used a
                  treatment. It does <em>not</em> mean that the treatment causes
                  more or less pain.
                  <br />
                  <br />
                  For example, if you only take painkillers when your pain is
                  high, the chart may show high pain on those days. This just
                  means that you tend to take painkillers only on bad days, not
                  that they cause more pain.
                </p>
              </details>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default Reports;

import { useState } from "react";
import CountryIndicatorTrend from "./CountryIndicatorTrend";   // Epic 1
import IndicatorVsHappiness from "./IndicatorVsHappiness";     // Epic 2
import RegionalHappiness from "./RegionalHappiness";           // Epic 3

function App() {
  const [view, setView] = useState("trend"); // default to Epic 1

  const tabStyle = (active) => ({
    padding: "10px 20px",
    margin: "0 5px",
    border: "none",
    borderBottom: active ? "3px solid #007BFF" : "3px solid transparent",
    backgroundColor: "transparent",
    fontSize: "16px",
    fontWeight: active ? "bold" : "normal",
    cursor: "pointer",
    color: active ? "#007BFF" : "#333",
  });

  return (
    <div style={{ width: "90%", margin: "20px auto", textAlign: "center" }}>
      <h1 style={{ marginBottom: "30px" }}>HappyData Dashboard</h1>

      {/* Navigation tabs */}
      <div style={{ borderBottom: "1px solid #ddd", marginBottom: "20px" }}>
        <button
          style={tabStyle(view === "trend")}
          onClick={() => setView("trend")}
        >
          Country Indicator Trends
        </button>
        <button
          style={tabStyle(view === "compare")}
          onClick={() => setView("compare")}
        >
          Indicator vs Happiness
        </button>
        <button
          style={tabStyle(view === "regional")}
          onClick={() => setView("regional")}
        >
          Regional Happiness Distribution
        </button>
      </div>

      {/* Conditional Rendering of Epics */}
      {view === "trend" && <CountryIndicatorTrend />}
      {view === "compare" && <IndicatorVsHappiness />}
      {view === "regional" && <RegionalHappiness />}
    </div>
  );
}

export default App;

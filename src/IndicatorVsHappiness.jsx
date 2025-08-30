import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import Papa from "papaparse";

// Chart.js setup
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Countries we’ll allow in dropdown
const COUNTRIES = [
  { name: "India", wb: "IND" },
  { name: "United States", wb: "USA" },
  { name: "China", wb: "CHN" },
  { name: "Finland", wb: "FIN" }
];

export default function IndicatorVsHappiness() {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [indicator, setIndicator] = useState("NY.GDP.MKTP.CD"); // GDP as default
  const [happinessMap, setHappinessMap] = useState({});
  const [chartData, setChartData] = useState(null);

  // Step A: Load happiness data from CSV
  useEffect(() => {
    const loadHappiness = async () => {
      const whrRes = await fetch(import.meta.env.BASE_URL + "whr.csv");
      const text = await res.text();
      const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });

      // Build { Country: { year: score } }
      const map = {};
      for (const row of data) {
        const cname = row["Country name"];
        const year = String(row["Year"]);
        const score = parseFloat(row["Ladder score"]); // ✅ real happiness score
        if (!cname || !year || isNaN(score)) continue;

        if (!map[cname]) map[cname] = {};
        map[cname][year] = score;
      }
      setHappinessMap(map);
    };

    loadHappiness();
  }, []);

  // Step B: Fetch WB indicator + align with happiness
  useEffect(() => {
    const fetchBoth = async () => {
      if (!Object.keys(happinessMap).length) return;

      const url = `https://api.worldbank.org/v2/country/${country.wb}/indicator/${indicator}?format=json`;
      const resp = await axios.get(url);
      const rows = resp.data[1] || [];

      const years = rows.map(r => r.date).reverse();
      const indicatorValues = rows.map(r => r.value).reverse();

      const happinessValues = years.map(
        y => happinessMap[country.name]?.[y] ?? null
      );

      setChartData({
        labels: years,
        datasets: [
          {
            label: `${country.name} • Indicator (${indicator})`,
            data: indicatorValues,
            borderColor: "blue",
            yAxisID: "y"
          },
          {
            label: `${country.name} • Happiness (0–10)`,
            data: happinessValues,
            borderColor: "orange",
            yAxisID: "y1"
          }
        ]
      });
    };

    fetchBoth();
  }, [country, indicator, happinessMap]);

  return (
    <div style={{ width: "80%", margin: "50px auto" }}>
      <h2>Indicator vs Happiness Comparison</h2>

      {/* Dropdowns */}
      <div style={{ marginBottom: 16 }}>
        <label>
          Country:{" "}
          <select
            value={country.wb}
            onChange={e =>
              setCountry(COUNTRIES.find(c => c.wb === e.target.value))
            }
          >
            {COUNTRIES.map(c => (
              <option key={c.wb} value={c.wb}>{c.name}</option>
            ))}
          </select>
        </label>

        <label style={{ marginLeft: 16 }}>
          Indicator:{" "}
          <select value={indicator} onChange={e => setIndicator(e.target.value)}>
            <option value="NY.GDP.MKTP.CD">GDP (current US$)</option>
            <option value="SP.POP.TOTL">Population</option>
            <option value="SE.ADT.LITR.ZS">Literacy Rate (%)</option>
          </select>
        </label>
      </div>

      {/* Chart */}
      {chartData ? (
        <Line
          data={chartData}
          options={{
            responsive: true,
            interaction: { mode: "index", intersect: false },
            stacked: false,
            scales: {
              y: { type: "linear", position: "left" },
              y1: { type: "linear", position: "right", grid: { drawOnChartArea: false } }
            }
          }}
        />
      ) : (
        <p>Loading…</p>
      )}
    </div>
  );
}

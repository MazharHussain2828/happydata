import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function CountryIndicatorTrend() {
  const [country, setCountry] = useState("IND"); // Default India
  const [indicator, setIndicator] = useState("NY.GDP.MKTP.CD"); // Default GDP
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const url = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json`;
      const response = await axios.get(url);
      const rawData = response.data[1];

      const years = rawData.map((d) => d.date).reverse();
      const values = rawData.map((d) => d.value).reverse();

      setChartData({
        labels: years,
        datasets: [
          {
            label: `${country} - ${indicator}`,
            data: values,
            borderColor: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.3)",
          },
        ],
      });
    };

    fetchData();
  }, [country, indicator]);

  return (
    <div style={{ width: "80%", margin: "50px auto" }}>
      <h2>Country Indicator Trend</h2>

      {/* Dropdowns */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          Country:{" "}
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="IND">India</option>
            <option value="USA">USA</option>
            <option value="CHN">China</option>
            <option value="BRA">Brazil</option>
            <option value="ZAF">South Africa</option>
          </select>
        </label>

        <label style={{ marginLeft: "20px" }}>
          Indicator:{" "}
          <select
            value={indicator}
            onChange={(e) => setIndicator(e.target.value)}
          >
            <option value="NY.GDP.MKTP.CD">GDP (current US$)</option>
            <option value="SP.POP.TOTL">Population</option>
            <option value="SE.ADT.LITR.ZS">Literacy Rate (%)</option>
            <option value="NY.GNP.PCAP.CD">GNI per capita (US$)</option>
          </select>
        </label>
      </div>

      {chartData ? <Line data={chartData} /> : <p>Loading chart...</p>}
    </div>
  );
}

export default CountryIndicatorTrend;

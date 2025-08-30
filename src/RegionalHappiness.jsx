import { useEffect, useRef } from "react";
import { Chart as ChartJS, Title, Tooltip, Legend } from "chart.js";
import {
  ChoroplethController,
  GeoFeature,
  ProjectionScale,
  ColorScale,
} from "chartjs-chart-geo";
import * as topojson from "topojson-client";
import Papa from "papaparse";

ChartJS.register(
  ChoroplethController,
  GeoFeature,
  ProjectionScale,
  ColorScale,
  Title,
  Tooltip,
  Legend
);

function RegionalHappiness() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      // Load WHR CSV
      const whrRes = await fetch("/whr.csv");
      const whrText = await whrRes.text();

      // Parse & extract only useful fields
      const raw = Papa.parse(whrText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
      }).data;

      const whr = raw.map((row) => ({
        Year: row["Year"],
        Country: row["Country name"],
        Score: row["Ladder score"],
      }));

      // Load TopoJSON world map
      const geoRes = await fetch("/countries-110m.json");
      const topoData = await geoRes.json();

      // Convert TopoJSON → GeoJSON
      const world = topojson.feature(topoData, topoData.objects.countries);
      const features = world.features;

      // Latest WHR year
      const latestYear = Math.max(...whr.map((d) => parseInt(d.Year)));
      const filtered = whr.filter((d) => parseInt(d.Year) === latestYear);

      // Map WHR country → happiness score
      const scoreMap = {};
      filtered.forEach((row) => {
        const country = row.Country?.trim();
        const score = parseFloat(row.Score);
        if (!isNaN(score)) scoreMap[country] = score;
      });

      // Debug logs
      console.log("Sample WHR countries:", filtered.slice(0, 10).map((d) => d.Country));
      console.log("Sample GeoJSON countries:", features.slice(0, 10).map((f) => f.properties.name));

      // Fix mismatched names
      const nameMapping = {
        "United States": "United States of America",
        Russia: "Russian Federation",
        "South Korea": "Korea, Rep.",
        "North Korea": "Korea, Dem. People’s Rep.",
        Venezuela: "Venezuela, RB",
        Iran: "Iran, Islamic Rep.",
        Egypt: "Egypt, Arab Rep.",
        Syria: "Syrian Arab Republic",
        Czechia: "Czech Republic",
        Slovakia: "Slovak Republic",
        Gambia: "Gambia, The",
        Bahamas: "Bahamas, The",
        Yemen: "Yemen, Rep.",
        "Hong Kong S.A.R.": "Hong Kong SAR, China",
        "Macau S.A.R.": "Macao SAR, China",
        "Ivory Coast": "Cote d'Ivoire",
        Tanzania: "Tanzania, United Rep.",
        Bolivia: "Bolivia, Plurinational State of",
        Moldova: "Moldova, Rep.",
      };

      Object.keys(nameMapping).forEach((whrName) => {
        if (scoreMap[whrName]) {
          scoreMap[nameMapping[whrName]] = scoreMap[whrName];
        }
      });

      // Build dataset
      const data = features.map((f) => ({
        feature: f,
        value: scoreMap[f.properties.name] || null,
      }));

      console.log("Example mapped data:", data.slice(0, 10));

      // ✅ Destroy old chart if it exists
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      // Draw choropleth
      chartRef.current = new ChartJS(canvasRef.current.getContext("2d"), {
        type: "choropleth",
        data: {
          labels: data.map((d) => d.feature.properties.name),
          datasets: [
            {
              label: "Happiness Score",
              data,
            },
          ],
        },
        options: {
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: `World Happiness Scores (${latestYear})`,
            },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  `${ctx.label}: ${
                    ctx.raw.value ? ctx.raw.value.toFixed(2) : "No data"
                  }`,
              },
            },
          },
          scales: {
            projection: {
              axis: "x",
              projection: "equalEarth",
            },
            color: {
              axis: "x",
              quantize: 6,
              legend: { position: "bottom-right" },
            },
          },
        },
      });
    };

    loadData();
  }, []);

  return (
    <div style={{ width: "95%", margin: "30px auto" }}>
      <h2>Regional Happiness Distribution</h2>
      <canvas ref={canvasRef} width={900} height={520}></canvas>
    </div>
  );
}

export default RegionalHappiness;

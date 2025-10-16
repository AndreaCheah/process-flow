import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import type { ExperimentData } from "../../types/reportTypes";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

interface ImpactBarChartProps {
  data: ExperimentData;
}

export default function ImpactBarChart({ data }: ImpactBarChartProps) {
  // Combine setpoint and condition impacts to show ALL variables
  const allImpacts: Record<string, number> = {};

  // Add setpoint impacts
  data.setpoint_impact_summary.forEach((item) => {
    const key = `${item.equipment}.${item.setpoint}`;
    allImpacts[key] = item.weightage;
  });

  // Add condition impacts
  data.condition_impact_summary.forEach((item) => {
    const key = `${item.equipment}.${item.condition}`;
    allImpacts[key] = item.weightage;
  });

  // Sort by impact (descending)
  const sortedImpact = Object.entries(allImpacts).sort(
    ([, a], [, b]) => b - a
  );

  const labels = sortedImpact.map(([key]) => key);
  const values = sortedImpact.map(([, value]) => value);

  // Color code based on impact level
  const getColor = (value: number) => {
    if (value >= 40) return "#ff4d4f";
    if (value >= 25) return "#faad14";
    if (value >= 15) return "#52c41a";
    return "#1890ff";
  };

  const backgroundColors = values.map((value) => getColor(value));
  const borderColors = values.map((value) => getColor(value));

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Impact (%)",
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const, // Horizontal bar chart
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Variable Impact Ranking",
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.x;
            let level = "";
            if (value >= 40) level = "High Impact";
            else if (value >= 25) level = "Medium-High Impact";
            else if (value >= 15) level = "Medium Impact";
            else level = "Low Impact";

            return [`${value.toFixed(2)}%`, level];
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: Math.max(...values) * 1.1, // Add 10% padding
        title: {
          display: true,
          text: "Impact Weightage (%)",
          font: {
            size: 12,
          },
        },
        ticks: {
          callback: function (value: any) {
            return value + "%";
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div>
      <Bar data={chartData} options={options} />
      <div
        style={{
          marginTop: "16px",
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          fontSize: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              backgroundColor: "#ff4d4f",
              borderRadius: "2px",
            }}
          />
          <span>High (≥40%)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              backgroundColor: "#faad14",
              borderRadius: "2px",
            }}
          />
          <span>Medium-High (25-40%)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              backgroundColor: "#52c41a",
              borderRadius: "2px",
            }}
          />
          <span>Medium (15-25%)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              backgroundColor: "#1890ff",
              borderRadius: "2px",
            }}
          />
          <span>Low (&lt;15%)</span>
        </div>
      </div>
    </div>
  );
}

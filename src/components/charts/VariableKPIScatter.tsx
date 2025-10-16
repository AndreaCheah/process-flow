import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Select } from "antd";
import { useState } from "react";
import type { ExperimentData } from "../../types/reportTypes";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, Title);

interface VariableKPIScatterProps {
  data: ExperimentData;
}

interface VariableOption {
  label: string;
  value: string;
  equipment: string;
  variableName: string;
}

export default function VariableKPIScatter({ data }: VariableKPIScatterProps) {
  // Extract all unique variables from scenarios
  const variableOptions: VariableOption[] = [];
  const scenarios = data.simulated_summary.simulated_data;

  // Collect all unique variable combinations
  const variableSet = new Set<string>();
  scenarios.forEach((scenario) => {
    scenario.equipment_specification.forEach((equip) => {
      equip.variables.forEach((variable) => {
        const key = `${equip.equipment}.${variable.name}`;
        if (!variableSet.has(key)) {
          variableSet.add(key);
          variableOptions.push({
            label: `${equip.equipment} - ${variable.name}`,
            value: key,
            equipment: equip.equipment,
            variableName: variable.name,
          });
        }
      });
    });
  });

  // Default to first top variable
  const defaultVariable = data.top_variables[0]
    ? `${data.top_variables[0].equipment}.${data.top_variables[0].name}`
    : variableOptions[0]?.value || "";

  const [selectedVariable, setSelectedVariable] = useState(defaultVariable);

  // Extract data for scatter plot
  const scatterData: { x: number; y: number }[] = [];
  let variableUnit = "";

  scenarios.forEach((scenario) => {
    scenario.equipment_specification.forEach((equip) => {
      equip.variables.forEach((variable) => {
        const key = `${equip.equipment}.${variable.name}`;
        if (key === selectedVariable) {
          scatterData.push({
            x: variable.value,
            y: scenario.kpi_value,
          });
          variableUnit = variable.unit;
        }
      });
    });
  });

  const selectedOption = variableOptions.find(
    (opt) => opt.value === selectedVariable
  );

  const chartData = {
    datasets: [
      {
        label: `${selectedOption?.label || "Variable"} vs KPI`,
        data: scatterData,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "#4BC0C0",
        borderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Variable Impact on KPI",
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return [
              `${selectedOption?.label}: ${context.parsed.x.toFixed(2)} ${variableUnit}`,
              `KPI: ${context.parsed.y.toFixed(2)}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: `${selectedOption?.label || "Variable"} (${variableUnit})`,
          font: {
            size: 12,
          },
        },
        ticks: {
          callback: function (value: any) {
            return value.toFixed(1);
          },
        },
      },
      y: {
        title: {
          display: true,
          text: `${scenarios[0]?.kpi || "KPI"}`,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <Select
          value={selectedVariable}
          onChange={setSelectedVariable}
          style={{ width: "100%" }}
          size="large"
          placeholder="Select a variable to analyze"
          options={variableOptions}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        />
      </div>
      <Scatter data={chartData} options={options} />
    </div>
  );
}

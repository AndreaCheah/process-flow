import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ExperimentData } from '../../types/reportTypes';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface KPILineChartProps {
  data: ExperimentData;
}

export default function KPILineChart({ data }: KPILineChartProps) {
  const scenarios = data.simulated_summary.simulated_data;

  // Sort scenarios by scenario number
  const sortedScenarios = [...scenarios].sort((a, b) => {
    const numA = parseInt(a.scenario.replace('Scenario ', ''));
    const numB = parseInt(b.scenario.replace('Scenario ', ''));
    return numA - numB;
  });

  const labels = sortedScenarios.map((s) => s.scenario.replace('Scenario ', ''));
  const kpiValues = sortedScenarios.map((s) => s.kpi_value);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'KPI Value',
        data: kpiValues,
        borderColor: '#4BC0C0',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#4BC0C0',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'KPI Values Across All Scenarios (Hover for Details)',
        font: {
          size: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        bodySpacing: 6,
        bodyFont: {
          size: 12,
        },
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        callbacks: {
          title: function (context: any) {
            const scenarioIndex = context[0].dataIndex;
            const scenario = sortedScenarios[scenarioIndex];
            return scenario.scenario;
          },
          beforeBody: function (context: any) {
            const scenarioIndex = context[0].dataIndex;
            const scenario = sortedScenarios[scenarioIndex];
            return `${scenario.kpi}: ${scenario.kpi_value.toFixed(3)}`;
          },
          label: function (context: any) {
            const scenarioIndex = context.dataIndex;
            const scenario = sortedScenarios[scenarioIndex];

            // Get all variables for this scenario
            const variables: string[] = [];
            scenario.equipment_specification.forEach((equipment) => {
              equipment.variables.forEach((variable) => {
                const varLabel = `  ${equipment.equipment}.${variable.name}: ${variable.value.toFixed(2)} ${variable.unit}`;
                variables.push(varLabel);
              });
            });

            return variables;
          },
          afterLabel: function (context: any) {
            const scenarioIndex = context.dataIndex;
            const kpiValue = sortedScenarios[scenarioIndex].kpi_value;
            const allKPIs = sortedScenarios.map(s => s.kpi_value);
            const maxKPI = Math.max(...allKPIs);
            const minKPI = Math.min(...allKPIs);
            const rank = allKPIs.sort((a, b) => b - a).indexOf(kpiValue) + 1;

            return `\nRank: #${rank} of ${scenarios.length}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Scenario Number',
        },
      },
      y: {
        title: {
          display: true,
          text: data.simulated_summary.simulated_data[0]?.kpi || 'KPI Value',
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}

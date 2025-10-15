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
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'KPI Values Across All Scenarios',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `KPI: ${context.parsed.y.toFixed(3)}`;
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

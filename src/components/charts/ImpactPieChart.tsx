import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import type { ExperimentData } from '../../types/reportTypes';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface ImpactPieChartProps {
  data: ExperimentData;
}

export default function ImpactPieChart({ data }: ImpactPieChartProps) {
  const labels = Object.keys(data.top_impact);
  const values = Object.values(data.top_impact);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Impact %',
        data: values,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Variable Impact Distribution (%)',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.parsed.toFixed(2)}%`;
          },
        },
      },
    },
  };

  return <Pie data={chartData} options={options} />;
}

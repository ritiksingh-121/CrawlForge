import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ data, options, height = 250 }) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11 },
          color: '#888',
        },
      },
      tooltip: {
        backgroundColor: '#171717',
        padding: 10,
        cornerRadius: 8,
      },
    },
    ...options,
  };

  const defaultData = {
    labels: ['Completed', 'Running', 'Failed', 'Pending'],
    datasets: [
      {
        data: [65, 15, 10, 10],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 166, 35, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div style={{ height }}>
      <Doughnut data={data || defaultData} options={defaultOptions} />
    </div>
  );
}

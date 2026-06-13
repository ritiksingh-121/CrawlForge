import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ data, options, height = 300 }) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#171717',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#888' },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { font: { size: 11 }, color: '#888' },
      },
    },
    ...options,
  };

  const defaultData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [12, 19, 8, 15, 22, 10, 5],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div style={{ height }}>
      <Bar data={data || defaultData} options={defaultOptions} />
    </div>
  );
}

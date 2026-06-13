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
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function LineChart({ data, options, height = 300 }) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
        beginAtZero: true,
      },
    },
    elements: {
      line: { tension: 0.4 },
      point: { radius: 0, hoverRadius: 5 },
    },
    ...options,
  };

  const defaultData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [10, 25, 18, 30, 22, 35],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        fill: true,
        borderWidth: 2,
      },
    ],
  };

  return (
    <div style={{ height }}>
      <Line data={data || defaultData} options={defaultOptions} />
    </div>
  );
}

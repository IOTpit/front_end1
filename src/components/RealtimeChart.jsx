// src/components/RealtimeChart.jsx - Biểu đồ Xu hướng môi trường chuẩn Figma
import React from 'react';
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
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function RealtimeChart({ dataPoints = [] }) {
  const labels = dataPoints.map((p) => {
    if (!p.time) return '';
    const d = new Date(p.time);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  });

  const tempData = dataPoints.map((p) => (p.temperature !== undefined ? p.temperature : 0));
  const humidData = dataPoints.map((p) => (p.humidity !== undefined ? p.humidity : 0));
  // Ánh sáng hiển thị chia 10 để tương thích dải trục 0-100 như bản thiết kế Figma
  const lightData = dataPoints.map((p) => (p.light !== undefined ? Math.min(100, p.light / 10) : 0));

  const data = {
    labels: labels.length ? labels : ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', 'Bây giờ'],
    datasets: [
      {
        label: 'Nhiệt độ (°C)',
        data: tempData.length ? tempData : [26, 30, 28, 48, 52, 68, 62],
        borderColor: '#D32F2F',
        backgroundColor: 'transparent',
        borderWidth: 3,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: '#D32F2F',
      },
      {
        label: 'Độ ẩm (%)',
        data: humidData.length ? humidData : [58, 52, 57, 65, 62, 50, 45],
        borderColor: '#555f6f',
        backgroundColor: 'transparent',
        borderWidth: 3,
        borderDash: [5, 5],
        tension: 0.35,
        pointRadius: 2,
        pointBackgroundColor: '#555f6f',
      },
      {
        label: 'Ánh sáng (lux/10)',
        data: lightData.length ? lightData : [12, 18, 42, 32, 28, 18, 10],
        borderColor: '#FBC02D',
        backgroundColor: 'transparent',
        borderWidth: 3,
        tension: 0.35,
        pointRadius: 2,
        pointBackgroundColor: '#FBC02D',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#555f6f',
          font: { family: 'Inter', size: 12, weight: '600' },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 24,
        },
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#151c27',
        bodyColor: '#555f6f',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        shadowBlur: 10,
        shadowColor: 'rgba(0,0,0,0.05)',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#8a94a6',
          font: { family: 'Inter', size: 11 },
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          color: '#8a94a6',
          font: { family: 'Inter', size: 11 },
        },
        grid: {
          color: '#f0f3ff',
        },
      },
    },
  };

  return (
    <div style={{ height: '320px', width: '100%', position: 'relative' }}>
      <Line data={data} options={options} />
    </div>
  );
}

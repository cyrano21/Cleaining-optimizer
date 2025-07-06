"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

interface ChartProps {
  data: any;
  height?: number;
  options?: any;
}

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
  },
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
    },
  },
};

export function LineChart({ data, height = 400, options }: ChartProps) {
  return (
    <div style={{ height }} data-oid="8bvw__.">
      <Line
        data={data}
        options={{ ...defaultOptions, ...options }}
        data-oid="tv_in2q"
      />
    </div>
  );
}

export function BarChart({ data, height = 400, options }: ChartProps) {
  return (
    <div style={{ height }} data-oid="jkbal6:">
      <Bar
        data={data}
        options={{ ...defaultOptions, ...options }}
        data-oid="_y.rgx:"
      />
    </div>
  );
}

export function PieChart({ data, height = 400, options }: ChartProps) {
  return (
    <div style={{ height }} data-oid="7uq.l45">
      <Pie
        data={data}
        options={{ ...pieOptions, ...options }}
        data-oid="p56g2w."
      />
    </div>
  );
}

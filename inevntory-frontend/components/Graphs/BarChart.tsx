'use client';
import React from "react";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type BarGraphProps = {
    data: Record<string, number>;
    title: string;
};

const BarGraph: React.FC<BarGraphProps> = ({ data, title }) => {
    const labels = Object.keys(data);
    const values = Object.values(data);

    const backgroundColors = labels.map(() => {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgba(${r}, ${g}, ${b}, 0.6)`;
    });

    const chartData = {
        labels,
        datasets: [
            {
                label: title,
                data: values,
                backgroundColor: backgroundColors,
                borderColor: "rgba(255,255,255,1)",
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function (context: any) {
                        const label = context.label || '';
                        const value = context.raw;
                        return `Part: ${label} - Used ${value} times`;
                    }
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
            },
        },
    };


    return (
        <div className="w-full max-w-3xl mx-auto">
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default BarGraph;

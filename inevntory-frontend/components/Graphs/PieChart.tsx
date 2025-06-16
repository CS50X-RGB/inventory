'use client';
import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { getElementAtEvent, Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type PieChartProps = {
    data: Record<string, number>;
    title: string
};

const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
    const router = useRouter();
    const chartRef = useRef<any>(null);

    const mapOfPrice: Record<string, number> = {};
    const values: number[] = [];
    const labels = Object.keys(data);

    labels.forEach((label) => {
        const innerObj = data[label];
        const price = Object.values(innerObj)[0];
        values.push(Number(Object.keys(innerObj)[0]));
        mapOfPrice[label] = price;
    });

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
                position: "bottom" as const,
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function (context: any) {
                        const label = context.label || '';
                        const value = context.raw;
                        return `Top Level: ${label} - Planned ${value} times with ₹${mapOfPrice[label]}`;
                    }
                }
            },
        },
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <Pie
                ref={chartRef}
                data={chartData}
                options={options}
                onClick={(event) => {
                    if (!chartRef.current) return;
                    const elements = getElementAtEvent(chartRef.current, event);
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const label = labels[index];

                        router.push(`/admin/planning/${label}`);
                    }
                }}
            />
        </div>
    );
};

export default PieChart;

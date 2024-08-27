// BarChartComponent.tsx
'use client';

import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';

export default function BarChartComponent({ data }: { data: Record<string, number> }) {
    return (
        <BarChart
            xAxis={[
                {
                    id: 'trlLevels',
                    data: Object.keys(data),
                    scaleType: 'band',
                    axisLabel: {
                        formatter: (value: string) => `TRL ${value}`, // Custom formatter
                        rotate: 45, // Rotate X-axis labels for better readability
                    },
                },
            ]}
            yAxis={[
                {
                    id: 'numberOfProjects',
                    title: 'Number of Projects',
                    axisLabel: {
                        formatter: (value: number) => `${value}`, // Y-axis label formatter
                    },
                },
            ]}
            series={[
                {
                    data: Object.values(data),
                    barWidth: '20%', // Set bar width to make them slimmer
                },
            ]}
            layout="vertical" // Set the chart layout to vertical
        />
    );
}

// PieChartComponent.tsx
'use client';

import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';

export default function PieChartComponent({ data, title }: { data: Record<string, number>; title: string }) {
    const pieData = Object.entries(data).map(([label, value]) => ({ label, value }));

    return (
        <div>
            <h3>{title}</h3>
            <PieChart
                width={400}
                height={400}
                series={[
                    {
                        data: pieData,
                        label: 'Projects',
                    },
                ]}
                label={({ dataEntry }) => `${dataEntry.label}: ${dataEntry.value}`}
            />
        </div>
    );
}

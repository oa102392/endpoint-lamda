// CustomPieChart.tsx
'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

// Define color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F', '#F9F871'];

// Interface for the data prop
interface PieChartComponentProps {
    data: Record<string, number>;
    title: string;
}

export default function CustomPieChart({ data, title }: PieChartComponentProps) {
    const pieData = Object.entries(data).map(([name, value]) => ({ name, value }));

    return (
        <div style={{ textAlign: 'center' }}>
            <h3>{title}</h3>
            <PieChart width={400} height={400}>
                <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </div>
    );
}

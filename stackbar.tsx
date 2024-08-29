// StackedBarChartComponent.tsx
'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Interface for the data prop
interface StackedBarChartComponentProps {
    data: { name: string; lifeCycleCost: number; fy2024Target: number }[];
    title: string;
}

export default function StackedBarChartComponent({ data, title }: StackedBarChartComponentProps) {
    return (
        <div style={{ textAlign: 'center', margin: '20px' }}>
            <h3>{title}</h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="lifeCycleCost" stackId="a" fill="#d3b8e4" name="Project Life Cycle Cost" />
                    <Bar dataKey="fy2024Target" stackId="a" fill="#6a0dad" name="Total Target FY 2024 Req" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

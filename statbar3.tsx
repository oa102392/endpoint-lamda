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

            {/* Container for the chart with a scrollable Y-axis */}
            <div style={{ position: 'relative', height: '450px', overflowY: 'scroll' }}>
                <ResponsiveContainer width="100%" height={data.length * 40}>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 50, bottom: 50 }} // Leave space for X-axis at bottom
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        
                        {/* YAxis (scrollable) */}
                        <YAxis
                            dataKey="name"
                            type="category"
                            tick={{ textAnchor: 'end' }}
                            tickMargin={10}
                            interval={0}
                        />

                        {/* Tooltip */}
                        <Tooltip />
                        <Legend />

                        {/* Bars */}
                        <Bar dataKey="lifeCycleCost" stackId="a" fill="#d3b8e4" name="Project Life Cycle Cost" />
                        <Bar dataKey="fy2024Target" stackId="a" fill="#6a0dad" name="Total Target FY 2024 Req" />
                    </BarChart>
                </ResponsiveContainer>

                {/* Fixed XAxis */}
                <div
                    style={{
                        position: 'sticky',
                        bottom: 0,
                        backgroundColor: '#fff',
                        zIndex: 100,
                        width: '100%',
                    }}
                >
                    <ResponsiveContainer width="100%" height={60}>
                        <BarChart data={data} layout="horizontal">
                            <XAxis
                                type="number"
                                tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
                                domain={[0, 'dataMax']}
                                ticks={[0, 200000000, 500000000, 750000000, 1000000000]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

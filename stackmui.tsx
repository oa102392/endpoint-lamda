'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box } from '@mui/material';

interface StackedBarChartComponentProps {
    data: { name: string; lifeCycleCost: number; fy2024Target: number }[];
}

export default function StackedBarChartComponent({ data }: StackedBarChartComponentProps) {
    return (
        <Box sx={{ width: '100%', height: '500px', position: 'relative' }}>
            {/* X-axis bar chart */}
            <Box sx={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
                <ResponsiveContainer width="100%" height={50}>
                    <BarChart
                        width={800}
                        height={60}
                        data={[]}
                    >
                        <XAxis
                            type="number"
                            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                            domain={[0, 'dataMax']}
                            ticks={[0, 200000000, 500000000, 750000000, 1000000000, 1250000000]}
                            interval={0}
                            label={{ value: 'Funding (USD)', position: 'insideBottomRight', offset: -10 }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Box>

            {/* Scrollable bar chart */}
            <Box sx={{ maxHeight: '450px', overflowY: 'scroll' }}>
                <ResponsiveContainer width="100%" height={data.length * 40}>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="lifeCycleCost" stackId="a" fill="#d3b8e4" name="Project Life Cycle Cost" />
                        <Bar dataKey="fy2024Target" stackId="a" fill="#6a0dad" name="Total Target FY 2024 Req" />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
}

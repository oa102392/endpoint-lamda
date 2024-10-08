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
        <div style={{maxHeight: '450px', overflowY:'scroll'}}>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 30, left: -75, bottom: 10 }}
                    layout="vertical"
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" 
                        tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} 
                        domain={[0, 'dataMax']} 
                        interval={0} 
                        ticks={[0, 200000000, 500000000, 750000000, 1000000000]} 
                            />
                    <YAxis dataKey="name" type="category" tick={{ textAnchor: 'end'}} tickMargin={10} interval={0} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="lifeCycleCost" stackId="a" fill="#d3b8e4" name="Project Life Cycle Cost" />
                    <Bar dataKey="fy2024Target" stackId="a" fill="#6a0dad" name="Total Target FY 2024 Req" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        </div>
    );
}


const CustomizedAxisTickX = ({ x, y, payload }: any) => {
    return (
        <g transform={`translate(${x},${y})`}>
            {/* Display custom X-axis label */}
            <text x={0} y={0} dy={16} textAnchor="middle" fontSize={12} fill="#333">
                {`$${(payload.value / 1000000).toFixed(0)}M`}
            </text>
        </g>
    );
};

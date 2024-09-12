'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StackedBarChartBySubprogramProps {
    data: { program: string; subprogram: string; lifeCycleCost: number; fy2024Target: number }[];
    title: string;
}

export default function StackedBarChartBySubprogram({ data, title }: StackedBarChartBySubprogramProps) {
    return (
        <div style={{ textAlign: 'center', margin: '20px' }}>
            <h3>{title}</h3>
            <ResponsiveContainer width="100%" height={data.length * 40}>
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 15, bottom: 10 }}
                    layout="vertical"
                    barCategoryGap={30}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    
                    {/* XAxis */}
                    <XAxis 
                        type="number" 
                        tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} 
                        domain={[0, 'dataMax']} 
                        interval={0} 
                        ticks={[0, 200000000, 500000000, 750000000, 1000000000]} 
                    />

                    {/* YAxis */}
                    <YAxis 
                        dataKey="subprogram" 
                        width={200} 
                        type="category" 
                        tickFormatter={(value, index) => {
                            // If first item of the program, include program name before subprogram
                            const currentProgram = data[index].program;
                            const prevProgram = index > 0 ? data[index - 1].program : null;
                            return prevProgram === currentProgram ? value : `${currentProgram}: ${value}`;
                        }}
                        tick={{ textAnchor: 'end' }} 
                        tickMargin={10} 
                        interval={0} 
                    />

                    {/* Tooltip */}
                    <Tooltip />
                    
                    {/* Legend */}
                    <Legend />

                    {/* Bars */}
                    <Bar dataKey="lifeCycleCost" barSize={20} stackId="a" fill="#d3b8e4" name="Project Life Cycle Cost" />
                    <Bar dataKey="fy2024Target" barSize={15} stackId="a" fill="#6a0dad" name="Total Target FY 2024 Req" />

                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}



const CustomizedAxisTick = ({ x, y, payload, data }: any) => {
    const { value, index } = payload;
    const program = data[index].program;
    const prevProgram = index > 0 ? data[index - 1].program : null;

    return (
        <g transform={`translate(${x},${y})`}>
            {/* Display program name if it changes */}
            {prevProgram !== program && (
                <text x={-200} y={0} dy={16} textAnchor="start" fontSize={12} fontWeight="bold" fill="#333">
                    {program}
                </text>
            )}
            {/* Display subprogram name */}
            <text x={0} y={0} dy={16} textAnchor="end" fontSize={12} fill="#333">
                {value}
            </text>
        </g>
    );
};
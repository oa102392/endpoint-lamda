import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box } from '@mui/material';

interface StackedBarChartBySubprogramProps {
    data: { program: string; subprogram: string; lifeCycleCost: number; fy2024Target: number }[];
}

export default function StackedBarChartBySubprogram({ data }: StackedBarChartBySubprogramProps) {

    // Group the subprograms under their respective programs
    const groupedData = data.map(({ program, subprogram, lifeCycleCost, fy2024Target }) => ({
        name: `${program} - ${subprogram}`, // Combine program and subprogram for Y-axis label
        lifeCycleCost,
        fy2024Target,
    }));

    return (
        <Box sx={{ width: '100%', height: '500px', overflowY: 'scroll', position: 'relative' }}>
            {/* Fixed X-axis */}
            <Box sx={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
                <ResponsiveContainer width="100%" height={60}>
                    <BarChart
                        data={groupedData}
                        layout="vertical"
                    >
                        <XAxis
                            type="number"
                            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                            label={{ value: 'Funding (USD)', position: 'insideBottomRight', offset: 0 }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Box>

            {/* Scrollable Y-axis and bars */}
            <ResponsiveContainer width="100%" height={groupedData.length * 40}>
                <BarChart
                    data={groupedData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 15, bottom: 10 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        tick={{ textAnchor: 'end' }} 
                        width={300}  // Increase for longer text
                        tickMargin={10} 
                    />
                    <Tooltip />
                    <Legend />
                    <Bar 
                        dataKey="lifeCycleCost" 
                        fill="#d3b8e4" 
                        name="Project Life Cycle Cost" 
                        barSize={20} 
                        stackId="a" 
                    />
                    <Bar 
                        dataKey="fy2024Target" 
                        fill="#6a0dad" 
                        name="Total Target FY 2024 Req" 
                        barSize={15} 
                        stackId="a" 
                    />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
}

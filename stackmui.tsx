import { BarChart } from '@mui/x-charts/BarChart';
import { Box } from '@mui/material';

interface StackedBarChartComponentProps {
    data: { name: string; lifeCycleCost: number; fy2024Target: number }[];
}

export default function StackedBarChartComponent({ data }: StackedBarChartComponentProps) {
    return (
        <Box sx={{ width: '100%', height: '500px', overflowY: 'scroll', position: 'relative' }}>

            {/* Sticky X-Axis BarChart */}
            <Box sx={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
                <BarChart
                    dataset={data}
                    width={800}
                    height={60}  // X-axis only height
                    xAxis={[
                        {
                            scaleType: 'linear',
                            tickFormatter: (value) => `${(value / 1000000).toFixed(1)}M`,
                            label: 'Funding (USD)',
                        },
                    ]}
                    series={[]}  // Empty series since it's only for the X-axis
                />
            </Box>

            {/* Scrollable bar chart */}
            <BarChart
                dataset={data}
                xAxis={null}  // Remove X-axis from scrollable section
                yAxis={[
                    {
                        scaleType: 'band',
                        dataKey: 'name', // Site or program names
                        label: 'Programs or Sites',
                        tickLabelPlacement: 'middle',
                    },
                ]}
                series={[
                    {
                        dataKey: 'lifeCycleCost',
                        label: 'Project Life Cycle Cost',
                        stack: 'total',
                        barSize: 10,
                    },
                    {
                        dataKey: 'fy2024Target',
                        label: 'Total Target FY 2024 Req',
                        stack: 'total',
                        barSize: 15,  // Example of varying size for the stacked bar
                    },
                ]}
                layout="horizontal"
                width={800}
                height={data.length * 40}  // Dynamic height based on data
                grid={{ vertical: true }}
            />
        </Box>
    );
}

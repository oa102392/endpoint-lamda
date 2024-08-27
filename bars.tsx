<Widget title="Project Technology Maturity" width={700}>
    <BarChart
        xAxis={[
            {
                id: 'trlLevels',
                data: Object.keys(technology_maturity),
                scaleType: 'band',
                axisLabel: {
                    formatter: (value) => `TRL ${value}`, // Label format
                    rotate: 45, // Rotate X-axis labels
                },
            },
        ]}
        yAxis={[
            {
                id: 'numberOfProjects',
                title: 'Number of Projects',
                axisLabel: {
                    formatter: (value) => `${value}`, // Y-axis values
                },
            },
        ]}
        series={[
            {
                data: Object.values(technology_maturity),
                barWidth: '20%', // Adjusts the bar width to make them slimmer
            },
        ]}
        layout="vertical" // Keep vertical layout
    />
</Widget>

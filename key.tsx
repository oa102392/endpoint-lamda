interface KeyStatsProps {
    activeProjects: number;
    startingProjects: number;
    endingProjects: number;
}

export default function KeyStats({ activeProjects, startingProjects, endingProjects }: KeyStatsProps) {
    return (
        <div
            style={{
                display: 'table', // Change the display to table to mimic a table layout
                width: '100%',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: 'transparent',
                borderSpacing: '8px 0', // Add space between table cells
            }}
        >
            <div style={{ display: 'table-row' }}>
                <span style={{ display: 'table-cell', fontWeight: 'bold', fontSize: '16px', paddingRight: '15px' }}>
                    {activeProjects}
                </span>
                <span style={{ display: 'table-cell', fontSize: '14px', color: '#666', textAlign: 'left' }}>
                    Active 2024
                </span>
            </div>
            <div style={{ display: 'table-row' }}>
                <span style={{ display: 'table-cell', fontWeight: 'bold', fontSize: '16px', paddingRight: '15px' }}>
                    {startingProjects}
                </span>
                <span style={{ display: 'table-cell', fontSize: '14px', color: '#666', textAlign: 'left' }}>
                    Starting 2025
                </span>
            </div>
            <div style={{ display: 'table-row' }}>
                <span style={{ display: 'table-cell', fontWeight: 'bold', fontSize: '16px', paddingRight: '15px' }}>
                    {endingProjects}
                </span>
                <span style={{ display: 'table-cell', fontSize: '14px', color: '#666', textAlign: 'left' }}>
                    Ending 2025
                </span>
            </div>
        </div>
    );
}

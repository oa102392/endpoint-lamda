interface KeyStatsProps {
    activeProjects: number;
    startingProjects: number;
    endingProjects: number;
}

export default function KeyStats({ activeProjects, startingProjects, endingProjects }: KeyStatsProps) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: 'Arial, sans-serif', // Use a clean, modern font
                padding: '10px',
                backgroundColor: 'transparent', // No background color
                borderRadius: '8px', // Rounded corners
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{activeProjects}</span>
                <span style={{ fontSize: '14px', color: '#666' }}>Active 2024</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{startingProjects}</span>
                <span style={{ fontSize: '14px', color: '#666' }}>Starting 2025</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{endingProjects}</span>
                <span style={{ fontSize: '14px', color: '#666' }}>Ending 2025</span>
            </div>
        </div>
    );
}

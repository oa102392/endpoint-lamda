export default function TotalProjects({ projectCount }: { projectCount: number }) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                fontFamily: 'Arial, sans-serif', // Use a clean, modern font
                backgroundColor: '#f0f4f8', // Optional: add a subtle background color
                padding: '20px',
                borderRadius: '8px', // Rounded corners for a modern look
            }}
        >
            <h2
                style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: '0',
                    color: '#333', // Dark color for the label
                }}
            >
                Total Projects
            </h2>
            <p
                style={{
                    fontSize: '48px', // Large font size for the number
                    fontWeight: 'bold',
                    margin: '10px 0 0 0',
                    color: '#0070f3', // Primary color for the number
                }}
            >
                {projectCount}
            </p>
        </div>
    );
}

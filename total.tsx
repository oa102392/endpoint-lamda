import React from 'react';

export default function TotalProjects({ projectCount }: { projectCount: number }) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                fontFamily: 'Arial, sans-serif', // You can replace this with a more suitable font if needed
                backgroundColor: '#f0f4f8', // A subtle background color, adjust as needed
                padding: '20px',
                borderRadius: '8px', // Rounded corners for a modern look
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // A soft shadow for a 3D effect
                border: '1px solid #ddd', // Light border to define edges
                width: '150px', // Width to make it more compact
                textAlign: 'center', // Center the text horizontally
            }}
        >
            <p
                style={{
                    fontSize: '14px',
                    fontWeight: 'normal',
                    margin: '0 0 10px 0',
                    color: '#666', // Subtle gray color for the label
                    letterSpacing: '0.5px',
                }}
            >
                Total Projects
            </p>
            <h2
                style={{
                    fontSize: '36px', // Large font size for the number
                    fontWeight: 'bold',
                    margin: '0',
                    color: '#333', // Dark color for the number
                }}
            >
                {projectCount}
            </h2>
        </div>
    );
}

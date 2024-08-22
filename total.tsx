import React from 'react';

export default function TotalProjects({ projectCount }: { projectCount: number }) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Arial, sans-serif', // Use a clean, modern font
                padding: '10px',
                textAlign: 'center', // Center the text horizontally
                backgroundColor: 'transparent', // Make the background transparent to remove the gray box
            }}
        >
            <h2
                style={{
                    fontSize: '48px', // Large font size for the number
                    fontWeight: 'bold',
                    margin: '0 0 10px 0', // Add space below the number
                    color: '#333', // Dark color for the number
                }}
            >
                {projectCount}
            </h2>
            <p
                style={{
                    fontSize: '14px',
                    fontWeight: 'normal',
                    margin: '0',
                    color: '#666', // Subtle gray color for the label
                    letterSpacing: '0.5px',
                }}
            >
                Total Projects
            </p>
        </div>
    );
}

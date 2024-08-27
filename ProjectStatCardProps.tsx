import React from 'react';

interface ProjectStatCardProps {
    count: number;
    title: string;
    icon: string; // Path to the icon or icon component
    iconAlt: string; // Alt text for the icon
}

const ProjectStatCard: React.FC<ProjectStatCardProps> = ({ count, title, icon, iconAlt }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '150px',
                height: '150px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                padding: '15px',
                textAlign: 'center',
            }}
        >
            <img src={icon} alt={iconAlt} style={{ width: '40px', height: '40px', marginBottom: '10px' }} />
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0' }}>{count}</h2>
            <p style={{ fontSize: '14px', color: '#666', margin: '5px 0 0' }}>{title}</p>
        </div>
    );
};

export default ProjectStatCard;




import React from 'react';
import ProjectStatCard from './components/ProjectStatCard';

export default async function Home() {
    const { projects } = await getProjectStats();
    const activeProjects = projects.filter(project => project.project_funding_start === 2024).length;
    const startingProjects = projects.filter(project => project.project_funding_start === 2025).length;
    const endingProjects = projects.filter(project => project.project_funding_end === 2025).length;

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <h1 className="flex place-items-center">NNSA TMT Dashboard</h1>

            {/* Flex container to arrange the project stat cards horizontally */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
                <ProjectStatCard
                    count={projects.length}
                    title="Total Projects"
                    icon="/icons/total-projects-icon.png"
                    iconAlt="Total Projects Icon"
                />
                <ProjectStatCard
                    count={activeProjects}
                    title="Active 2024 Projects"
                    icon="/icons/active-projects-icon.png"
                    iconAlt="Active Projects Icon"
                />
                <ProjectStatCard
                    count={startingProjects}
                    title="Projects Starting in 2025"
                    icon="/icons/starting-projects-icon.png"
                    iconAlt="Starting Projects Icon"
                />
                <ProjectStatCard
                    count={endingProjects}
                    title="Projects Ending in 2025"
                    icon="/icons/ending-projects-icon.png"
                    iconAlt="Ending Projects Icon"
                />
            </div>

            {/* Rest of your component */}
        </main>
    );
}

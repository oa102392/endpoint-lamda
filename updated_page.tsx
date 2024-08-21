import {BarChart, PieChart} from './lib/mui';
import DataTable from './lib/Table';
import Widget from './lib/Widget';
import Row from './lib/Row';

async function getData() {
    const res = await fetch('http://localhost:3000/api/data');
    if(!res.ok){
        throw new Error('Failed to fetch data');
    }
    return res.json();
}

async function getProjectStats() {
    const res = await fetch('http://localhost:3000/api/projects');
    if(!res.ok){
        throw new Error('Failed to fetch project stats');
    }
    return res.json();
}

export default async function Home(){
    const { table, quarters, bars, pie } = await getData();
    const projectStats = await getProjectStats();

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <h1 className="flex place-items-center"> NNSA TMT Dashboard </h1>

            {/* First Row: Summary Widgets */}
            <Row height={150}>
                <Widget title="Total Projects" width={300}>
                    <h2>{projectStats.project_count}</h2>
                </Widget>
                <Widget title="Key Stats" width={300}>
                    <div>Active: {projectStats.active_project_count}</div>
                    <div>Starting 2024: {projectStats.starting_project_count}</div>
                    <div>Ending 2025: {projectStats.ending_project_count}</div>
                </Widget>
                <Widget title="Technology Maturity" width={400}>
                    <BarChart
                        yAxis={[
                            {
                                id: 'techMaturity',
                                data: Object.keys(projectStats.technology_maturity),
                                scaleType: 'band',
                            },
                        ]}
                        series={[
                            {
                                data: Object.values(projectStats.technology_maturity),
                            },
                        ]}
                        layout="horizontal"
                    />
                </Widget>
            </Row>

            {/* Second Row: Project Table and Technology Maturity Chart */}
            <Row height={400}>
                <Widget title="Project Funding Table" width={700}>
                    <DataTable />
                </Widget>
                <Widget title="Project Technology Maturity" width={700}>
                    <BarChart
                        yAxis={[
                            {
                                id: 'trlLevels',
                                data: Object.keys(projectStats.technology_maturity),
                                scaleType: 'band',
                            },
                        ]}
                        series={[
                            {
                                data: Object.values(projectStats.technology_maturity),
                            },
                        ]}
                        layout="horizontal"
                    />
                </Widget>
            </Row>

            {/* Existing Rows */}
            <Row height={400}>
                <Widget title="Table example" width={700}>
                    <DataTable />
                </Widget>
                <Widget title="Bar Chart example" width={700}>
                    <BarChart
                        series={quarters.data}
                        xAxis={[{ data: quarters.labels, scaleType: 'band'}]}
                    />
                </Widget>
            </Row>
            <Row height={350}>
                <Widget title="Pie Chart Example" width={550}>
                    <PieChart
                        colors={pie.colors}
                        series={[{ data: pie.data}]}
                    />
                </Widget>
                <Widget title="Bar Chart Example" width={850}>
                    <BarChart
                        yAxis={[
                            {
                                id: 'barCategories',
                                data: bars.categories,
                                scaleType:'band',
                            },
                        ]}
                        series={[
                            {
                                data: bars.data,
                            },
                        ]}
                        layout="horizontal"
                    />
                </Widget>
            </Row>
        </main>
    );
}

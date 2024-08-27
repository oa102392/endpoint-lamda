import {BarChart, PieChart} from './lib/mui';
import DataTable from './lib/Table';
import Widget from './lib/Widget';
import Row from './lib/Row';

async function getData() {
    const res = await fetch('http://localhost:3000/api/data')
    if(!res.ok){
        throw new Error('Failed to fetched data')
    }
    return res.json()
}

export default async function Home(){
    const { table, quarters, bars, pie } = await getData()
    return (
        <main className ="flex min-h-screen flex-col items-center justify-between p-24">
            <h1 className="flex place-items-center"> NNSA TMT Dashboard </h1>
            <Row height={400}>
                <Widget title="Table example" width={700}>
                    <DataTable>
                    </DataTable>
                </Widget>
                <Widget title="table chart example" width={700}>
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
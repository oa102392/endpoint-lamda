import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface ProjectRow {
    project_index: string;
    site: string;
    program: string;
    project_funding_start: number;
    project_funding_end: number;
    current_trl: number;
}

const columns: GridColDef[] = [
    { field: 'project_index', headerName: 'Project Index', width: 150 },
    { field: 'site', headerName: 'Site', width: 150 },
    { field: 'program', headerName: 'Program', width: 150 },
    { field: 'project_funding_start', headerName: 'Funding Start', width: 150 },
    { field: 'project_funding_end', headerName: 'Funding End', width: 150 },
    { field: 'current_trl', headerName: 'Current TRL', width: 150 },
];

export default function DataTable({ rows }: { rows: ProjectRow[] }) {
    return (
        <div style={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row.project_index}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 5 },
                    },
                }}
                pageSizeOptions={[5, 10]}
            />
        </div>
    );
}

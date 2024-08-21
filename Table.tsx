import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid'; 
    
const columns: GridColDef[] = [
    {field: 'id', headerName: 'ID', width: 70},
    {field: 'firstName', headerName: 'FirstName', width: 130},
    {field: 'lastName', headerName: 'Last Name', width: 130,
    {
        field: 'age',
        headerName: 'Age',
        type: 'number',
        width: 90,
    },
    {
        field: 'fullName',
        headerName: 'Full Name',
        description: 'This column has a value getter and is not sortable.',
        sortable: false,
        width: 160,


    },
];

const rows = [
    {id:1, lastName:'Snow', firstName:'Jon', age: 35, fullName: 'Jon Snow'}
];

export default async function DataTable() {
    return (
        <div>
            <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
                pagination: {
                    paginationModel: { page:0, pageSize: 5},
                },
            }}
            pageSizeOptions={[5, 10]}
            />
        </div>
    );
}
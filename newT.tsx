import React, { useState } from "react";
import {
    DataGrid,
    GridColDef,
    GridFooter,
    GridFooterContainer,
} from "@mui/x-data-grid";

interface ProjectRow {
    id: string;
    title: string;
    site: string;
    program: string;
    sub_program: string;
    target_fy_2024_req: string | null;
}

const columns: GridColDef[] = [
    {
        field: "id",
        headerName: "Project Index",
        type: "number",
        width: 60,
        renderHeader: (params) => (
            <div style={{ whiteSpace: "normal", wordWrap: "break-word", lineHeight: "normal" }}>
                {params.colDef.headerName}
            </div>
        ),
    },
    {
        field: "title",
        headerName: "Project Title",
        width: 400,
    },
    { field: "site", headerName: "Site", width: 90 },
    { field: "program", headerName: "Program", width: 75 },
    {
        field: "sub_program",
        headerName: "Sub-program",
        width: 250,
    },
    {
        field: "target_fy_2024_req",
        headerName: "Proj Target FY 2024 Req",
        width: 130,
        renderHeader: (params) => (
            <div style={{ whiteSpace: "normal", wordWrap: "break-word", lineHeight: "normal" }}>
                {params.colDef.headerName}
            </div>
        ),
    },
];

export default function DataTable({ rows }: { rows?: ProjectRow[] }) {
    const [filteredRows, setFilteredRows] = useState<ProjectRow[]>(rows || []);
    const [filters, setFilters] = useState({
        site: "",
        program: "",
        trl: "",
    });

    const sites = [
        "HQ-RSV",
        "NETL",
        "LLNL",
        "KCNSC",
        "NNSS",
        "SNL-CREST",
        "DI",
        "LANL",
        "ORNL",
        "CNS/Y-12",
        "NS",
        "PNNL",
        "APT/FTP",
        "SRNL-BSRA",
        "SNL",
        "CNS/PX",
    ];

    const programs = ["ENG", "IA", "WTMM"];
    const trls = ["TRL 1", "TRL 2", "TRL 3", "TRL 4", "TRL 5", "TRL 6", "TRL 7"];

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };

        setFilters(newFilters);

        // Filter rows based on selected filters
        const filtered = (rows || []).filter((row) => {
            const siteMatch = !newFilters.site || row.site === newFilters.site;
            const programMatch = !newFilters.program || row.program === newFilters.program;
            const trlMatch = !newFilters.trl || row.target_fy_2024_req === newFilters.trl;

            return siteMatch && programMatch && trlMatch;
        });

        setFilteredRows(filtered);
    };

    const customFooter = (total: number) => (
        <GridFooterContainer>
            <div style={{ padding: "0 10px", width: "30%", textAlign: "right" }}>
                <p>
                    <strong>Total Target FY 2024 Req (ALL TRLs): </strong>
                    {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
            <GridFooter />
        </GridFooterContainer>
    );

    const totalTarget = filteredRows.reduce(
        (sum, row) => sum + (row.target_fy_2024_req ? parseFloat(row.target_fy_2024_req) : 0),
        0
    );

    return (
        <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                {/* Site Filter */}
                <select name="site" value={filters.site} onChange={handleFilterChange}>
                    <option value="">All Sites</option>
                    {sites.map((site, index) => (
                        <option key={index} value={site}>
                            {site}
                        </option>
                    ))}
                </select>

                {/* Program Filter */}
                <select name="program" value={filters.program} onChange={handleFilterChange}>
                    <option value="">All Programs</option>
                    {programs.map((program, index) => (
                        <option key={index} value={program}>
                            {program}
                        </option>
                    ))}
                </select>

                {/* TRL Filter */}
                <select name="trl" value={filters.trl} onChange={handleFilterChange}>
                    <option value="">All TRLs</option>
                    {trls.map((trl, index) => (
                        <option key={index} value={trl}>
                            {trl}
                        </option>
                    ))}
                </select>
            </div>

            {/* Data Table */}
            <div style={{ height: 470, width: "100%" }}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    getRowId={(row) => row.id}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 50 },
                        },
                    }}
                    pageSizeOptions={[10, 50, 100]}
                    slots={{
                        footer: () => customFooter(totalTarget),
                    }}
                />
            </div>
        </div>
    );
}

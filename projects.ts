import type { NextApiRequest, NextApiResponse } from 'next'
import pg from 'pg'

type ResponseData =  {
    project_count: number
    active_project_count: number
    starting_project_count: number
    ending_project_count: number
    technology_maturity: TechnologyMaturity
    projects_by_site: any
    projects_by_program: any
    projects: Project[]
}

type TechnologyMaturity = {
    '1': number
    '2': number
    '3': number
    '4': number
    '5': number
    '6': number
    '7': number
    '8': number
    '9': number
}

type Project = {
    project_index: string
    project_funding_start: number
    project_funding_end: number
    target_fy_2024_req: number
    current_trl: number
    site: string
    program: string
}
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const { Client } = pg
    const client = new Client()
    await client.connect()

    const projects = <Project[]>(await client.query(
        'select project_index, project_title, project_funding_start, project_funding_end, current_trl, site, program, target_fy_2024_req, life_cycle_cost, subprogram from sandbox.investment where project_index is not null and project_index != 259'
    )).rows
    
    const project_count = projects.length
    const active_project_count = projects.filter(({ project_funding_start})=> project_funding_start == 2024 ).length
    const starting_project_count = projects.filter(({ project_funding_start})=> project_funding_start == 2025 ).length
    const ending_project_count = projects.filter(({ project_funding_end})=> project_funding_end == 2025 ).length
    let technology_maturity = Array.from(Array(9).keys()).reduce((x: any, i: number)=>{x[i+1] = 0; return x}, {})
    let projects_by_site: any = {}
    let projects_by_program: any = {}
    projects.forEach(({ current_trl, site, program}) => {
        technology_maturity[current_trl] ++
        if(!(site in projects_by_program)){
            projects_by_site[site] = 0
        }
        projects_by_site[site] ++
        if (!(program in projects_by_program)){
            projects_by_program[program] = 0
        }
        projects_by_program[program] ++

    })

    res.status(200).json({
        project_count,
        active_project_count,
        ending_project_count,
        starting_project_count,
        technology_maturity,
        projects_by_site,
        projects_by_program,
        projects: []
    })
    await client.end()

}
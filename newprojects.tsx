import type { NextApiRequest, NextApiResponse } from 'next';
import pg from 'pg';

type ResponseData = {
  project_count: number;
  active_project_count: number;
  starting_project_count: number;
  ending_project_count: number;
  technology_maturity: TechnologyMaturity;
  funding_by_site: { name: string; life_cycle_cost: number; fy2024_target: number }[];
  funding_by_subprogram: { name: string; life_cycle_cost: number; fy2024_target: number }[];
  projects: Project[];
};

type TechnologyMaturity = {
  [key: string]: number;
};

type Project = {
  project_index: string;
  project_funding_start: number;
  project_funding_end: number;
  target_fy_2024_req: number;
  life_cycle_cost: number;
  current_trl: number;
  site: string;
  program: string;
  subprogram: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { Client } = pg;
  const client = new Client();
  await client.connect();

  const projects = <Project[]>(await client.query(
    'SELECT project_index, project_funding_start, project_funding_end, current_trl, site, program, target_fy_2024_req, life_cycle_cost, subprogram FROM sandbox.investment WHERE project_index IS NOT NULL AND project_index != 259'
  )).rows;

  const project_count = projects.length;
  const active_project_count = projects.filter(({ project_funding_start }) => project_funding_start === 2024).length;
  const starting_project_count = projects.filter(({ project_funding_start }) => project_funding_start === 2025).length;
  const ending_project_count = projects.filter(({ project_funding_end }) => project_funding_end === 2025).length;

  const technology_maturity: TechnologyMaturity = Array.from({ length: 9 }, (_, i) => ({ [i + 1]: projects.filter(p => p.current_trl === i + 1).length }))
    .reduce((acc, cur) => ({ ...acc, ...cur }), {});

  // Aggregate data by site
  const funding_by_site = Object.entries(
    projects.reduce((acc, { site, life_cycle_cost, target_fy_2024_req }) => {
      if (!acc[site]) acc[site] = { life_cycle_cost: 0, fy2024_target: 0 };
      acc[site].life_cycle_cost += life_cycle_cost || 0;
      acc[site].fy2024_target += target_fy_2024_req || 0;
      return acc;
    }, {} as Record<string, { life_cycle_cost: number; fy2024_target: number }>)
).map(([name, values]) => ({
    name, // The site name (e.g., "SNL")
    lifeCycleCost: values.life_cycle_cost, // Aggregated life cycle cost
    fy2024Target: values.fy2024_target, // Aggregated FY 2024 target
  }));

  // Aggregate data by subprogram
  const funding_by_subprogram = Object.entries(
    projects.reduce((acc, { program, subprogram, life_cycle_cost, target_fy_2024_req }) => {
      if (!acc[subprogram]) acc[subprogram] = { program, life_cycle_cost: 0, fy2024_target: 0 };
      acc[subprogram].life_cycle_cost += life_cycle_cost || 0;
      acc[subprogram].fy2024_target += target_fy_2024_req || 0;
      return acc;
    }, {} as Record<string, { program: string; subprogram: string; life_cycle_cost: number; fy2024_target: number }>)
).map(([subprogram, values]) => ({
    program: values.program,
    subprogram: subprogram,
    lifeCycleCost: values.life_cycle_cost, // Aggregated life cycle cost
    fy2024Target: values.fy2024_target, // Aggregated FY 2024 target
  }));

  res.status(200).json({
    project_count,
    active_project_count,
    starting_project_count,
    ending_project_count,
    technology_maturity,
    funding_by_site,
    funding_by_subprogram,
    projects: []
  });

  await client.end();
}


// Function to aggregate by program and subprogram
function aggregateByProgramAndSubprogram(projects: Project[]): { program: string; subprogram: string; lifeCycleCost: number; fy2024Target: number }[] {
  return Object.entries(
    projects.reduce((acc, { program, subprogram, life_cycle_cost, target_fy_2024_req }) => {
      const key = `${program}-${subprogram}`;
      if (!acc[key]) {
        acc[key] = {
          program,
          subprogram,
          lifeCycleCost: 0,
          fy2024Target: 0,
        };
      }
      acc[key].lifeCycleCost += life_cycle_cost || 0;
      acc[key].fy2024Target += target_fy_2024_req || 0;
      return acc;
    }, {} as Record<string, { program: string; subprogram: string; lifeCycleCost: number; fy2024Target: number }>)
  ).map(([_, values]) => values);
}


// Aggregate data by subprogram
const funding_by_subprogram = Object.entries(
  projects.reduce((acc, { program, subprogram, life_cycle_cost, target_fy_2024_req }) => {
    // Initialize subprogram entry if it doesn't exist yet
    if (!acc[subprogram]) {
      acc[subprogram] = { 
        program,  // Add the program field here
        life_cycle_cost: 0, 
        fy2024_target: 0 
      };
    }

    // Handle possible null or undefined values, and accumulate them
    acc[subprogram].life_cycle_cost += life_cycle_cost || 0;
    acc[subprogram].fy2024_target += target_fy_2024_req || 0;
    
    return acc;
  }, {} as Record<string, { program: string; life_cycle_cost: number; fy2024_target: number }>)
).map(([subprogram, values]) => ({
  program: values.program,      // Include the program
  subprogram,                   // Subprogram name
  lifeCycleCost: values.life_cycle_cost,  // Aggregated life cycle cost
  fy2024Target: values.fy2024_target      // Aggregated FY 2024 target
}));

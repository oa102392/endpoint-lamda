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
  projects_by_site_for_pie: { name: string; value: number }[]; // Add this new key for pie chart
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
    'SELECT project_index, project_title, project_funding_start, project_funding_end, current_trl, site, program, target_fy_2024_req, life_cycle_cost, subprogram FROM sandbox.investment WHERE project_index IS NOT NULL AND project_index != 259'
  )).rows;

  const project_count = projects.length;
  const active_project_count = projects.filter(({ project_funding_start }) => project_funding_start === 2024).length;
  const starting_project_count = projects.filter(({ project_funding_start }) => project_funding_start === 2025).length;
  const ending_project_count = projects.filter(({ project_funding_end }) => project_funding_end === 2025).length;

  const technology_maturity: TechnologyMaturity = Array.from({ length: 9 }, (_, i) => ({ [i + 1]: projects.filter(p => p.current_trl === i + 1).length }))
    .reduce((acc, cur) => ({ ...acc, ...cur }), {});

  // Aggregate data by site for the pie chart
  const sitesOfInterest = ["LANL", "LLNL", "SNL", "KCNSC", "CNS/PX", "CNS/Y-12", "SRNL-BRSA"];
  const projects_by_site_for_pie = projects.reduce((acc, { site }) => {
    if (!acc[site]) acc[site] = 0;
    acc[site]++;
    return acc;
  }, {} as Record<string, number>);

  // Create the formatted data for the pie chart
  const pieData = Object.entries(projects_by_site_for_pie)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // Sort in descending order
  
  const filteredPieData = pieData.filter(item => sitesOfInterest.includes(item.name));
  const otherCount = pieData.filter(item => !sitesOfInterest.includes(item.name)).reduce((acc, item) => acc + item.value, 0);
  if (otherCount > 0) {
    filteredPieData.push({ name: "Other", value: otherCount });
  }

  // Continue with other data aggregation
  const funding_by_site = Object.entries(
    projects.reduce((acc, { site, life_cycle_cost, target_fy_2024_req }) => {
      if (!acc[site]) acc[site] = { life_cycle_cost: 0, fy2024_target: 0 };
      acc[site].life_cycle_cost += life_cycle_cost;
      acc[site].fy2024_target += target_fy_2024_req;
      return acc;
    }, {} as Record<string, { life_cycle_cost: number; fy2024_target: number }>)
  ).map(([name, values]) => ({ name, ...values }));

  const funding_by_subprogram = Object.entries(
    projects.reduce((acc, { subprogram, life_cycle_cost, target_fy_2024_req }) => {
      if (!acc[subprogram]) acc[subprogram] = { life_cycle_cost: 0, fy2024_target: 0 };
      acc[subprogram].life_cycle_cost += life_cycle_cost;
      acc[subprogram].fy2024_target += target_fy_2024_req;
      return acc;
    }, {} as Record<string, { life_cycle_cost: number; fy2024_target: number }>)
  ).map(([name, values]) => ({ name, ...values }));

  res.status(200).json({
    project_count,
    active_project_count,
    starting_project_count,
    ending_project_count,
    technology_maturity,
    funding_by_site,
    funding_by_subprogram,
    projects, // Ensure the full projects array is returned
    projects_by_site_for_pie: filteredPieData, // Add this for the pie chart
  });

  await client.end();
}

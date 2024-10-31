// app/models/Project.ts
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity('investment', { schema: 'api' })
export class Project extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  project_title: string;

  @Column()
  project_funding_start: number;

  @Column()
  project_funding_end: number;

  @Column()
  current_trl: number;

  @Column()
  site: string;

  @Column()
  program: string;

}



// src/pages/api/projects.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Project } from '@/app/models/Project'; // Adjust the import path as necessary

// GET handler to retrieve projects
export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Use TypeORM to find all projects
    const projects = await Project.find();
    res.status(200).json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

// POST handler to create a new project
export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { project_title, project_funding_start, project_funding_end, current_trl, site, program } = req.body;

    // Create a new project instance
    const project = Project.create({
      project_title,
      project_funding_start,
      project_funding_end,
      current_trl,
      site,
      program,
    });

    // Save the new project to the database
    await project.save();

    res.status(201).json({ message: 'Project created successfully' });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
}

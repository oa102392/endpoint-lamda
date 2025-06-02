// app/projects/list/page.tsx

'use client';
import { useEffect, useState } from 'react';

type Project = {
  project_index: number;
  project_title: string;
  site: string;
  program: string;
  sub_program: string;
  is_approved: boolean;
};

export default function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProjects = async () => {
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProjects(data);
  };

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const toggleApproval = async (project_index: number, currentValue: boolean) => {
    await fetch(`/api/projects/${project_index}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_approved: !currentValue }),
    });
    fetchProjects(); // Refresh after toggle
  };

  const filteredProjects = projects.filter((proj) =>
    proj.project_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Project List</h1>
      <input
        type="text"
        placeholder="Search by title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border px-4 py-2 mb-4 w-full"
      />

      <div className="space-y-4">
        {filteredProjects.map((proj) => (
          <div
            key={proj.project_index}
            className="flex justify-between items-center border p-4 rounded shadow"
          >
            <div>
              <p className="font-semibold">{proj.project_title}</p>
              <p className="text-sm text-gray-600">
                Index: {proj.project_index} | Site: {proj.site} | Program: {proj.program} | Subprogram: {proj.sub_program}
              </p>
            </div>
            <label className="flex items-center space-x-2">
              <span>Approved:</span>
              <input
                type="checkbox"
                checked={proj.is_approved}
                onChange={() => toggleApproval(proj.project_index, proj.is_approved)}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}



// app/api/projects/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/app/data_source';
import { Project } from '@/app/entity/project';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const repo = AppDataSource.getRepository(Project);
    const project = await repo.findOneBy({ project_index: Number(params.id) });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    project.is_approved = body.is_approved;
    await repo.save(project);

    return NextResponse.json({ message: 'Project updated', project });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error updating project' }, { status: 500 });
  }
}


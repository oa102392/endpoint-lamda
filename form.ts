export async function POST(request: any) {
    try {
        const {
            project_title,
            scope_description,
            need,
            benefit,
            risks_challenges,
            strategic_priorities,
            team_priorities,
        } = await request.json();

        const projectRepository = await project_table();
        const newProject = projectRepository.create({
            title: project_title,
            description: scope_description,
            need,
            benefit,
            risks_challenges,
            strategic_priorities,
            team_priorities,
        });

        await projectRepository.save(newProject);

        return NextResponse.json({ message: "Project added successfully", project: newProject }, { status: 201 });
    } catch (error) {
        console.error("Error saving project:", error);
        return NextResponse.json({ error: "Failed to add project" }, { status: 500 });
    }
}
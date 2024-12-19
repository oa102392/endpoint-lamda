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




import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

const AddProject = () => {
    const { register, handleSubmit } = useForm();
    const router = useRouter();

    const onSubmit = async (data) => {
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error("Failed to add project");
            }

            const result = await res.json();
            alert(result.message);

            // Redirect to projects page
            router.push("/projects");
        } catch (error) {
            console.error("Error adding project:", error);
            alert("Failed to add project. Please try again.");
        }
    };

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

    const sub_programs = [
        "Weapons Survivability",
        "25-D-XXX CREST, SNL",
        "Delivery Environments",
        "Archiving and Support",
        "Aging and Lifetimes",
        "Stockpile Responsiveness Program",
        "Studies and Assessments",
        "Advanced Cert and Qual",
        "Surety Technologies",
        "Weapon Technology Development",
        "Advanced Manufacturing Development",
    ];

    return (
        <main className="form-container">
            <h1>Add New Project</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label>Project Title</label>
                    <input {...register("title", { required: true })} />
                </div>
                <div>
                    <label>Scope Description</label>
                    <textarea {...register("description", { required: true })}></textarea>
                </div>
                <div>
                    <label>Site</label>
                    <select {...register("site", { required: true })}>
                        <option value="">Select a Site</option>
                        {sites.map((site, index) => (
                            <option key={index} value={site}>
                                {site}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Program</label>
                    <select {...register("program", { required: true })}>
                        <option value="">Select a Program</option>
                        {programs.map((program, index) => (
                            <option key={index} value={program}>
                                {program}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Sub Program</label>
                    <select {...register("sub_program", { required: true })}>
                        <option value="">Select a Sub Program</option>
                        {sub_programs.map((subProgram, index) => (
                            <option key={index} value={subProgram}>
                                {subProgram}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit">Submit</button>
            </form>
        </main>
    );
};

export default AddProject;

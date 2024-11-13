import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';

const AddProject = () => {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await fetch("http://localhost:3000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to add project");
      }

      const message = await res.json();
      alert(message);
      router.push("/projects");
    } catch (error) {
      console.log("Failed to add project", error);
      alert("Failed to add project");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="flex place-items-center">Add New Project</h1>
      <form onSubmit={handleSubmit(onSubmit)} method="POST" className="w-full max-w-lg">
        <div>
          <label>Project Title</label>
          <input className="form-control" {...register("project_title", { required: true })} />
        </div>

        <div>
          <label>Scope Description</label>
          <textarea className="form-control" {...register("scope_description", { required: true })}></textarea>
        </div>

        <div>
          <label>Need</label>
          <textarea className="form-control" {...register("need", { required: true })}></textarea>
        </div>

        <div>
          <label>Benefit</label>
          <textarea className="form-control" {...register("benefit", { required: true })}></textarea>
        </div>

        <div>
          <label>Risks and Challenges</label>
          <textarea className="form-control" {...register("risks_challenges", { required: true })}></textarea>
        </div>

        <div>
          <label>NA-115 Strategic Priorities</label>
          <textarea className="form-control" {...register("strategic_priorities", { required: false })}></textarea>
        </div>

        <div>
          <label>Team Priorities</label>
          <textarea className="form-control" {...register("team_priorities", { required: false })}></textarea>
        </div>

        <div>
          <label>Program Priorities</label>
          <textarea className="form-control" {...register("program_priorities", { required: false })}></textarea>
        </div>

        <div>
          <label>Partnership and Collaborations (Internal & External)</label>
          <textarea className="form-control" {...register("partnership_collaborations", { required: false })}></textarea>
        </div>

        <div>
          <label>Completion / Transition Target FY</label>
          <input type="number" className="form-control" {...register("completion_target_fy", { required: true })} />
        </div>

        <div>
          <label>Funding ($K)</label>
          <input type="number" className="form-control" {...register("funding", { required: false })} />
        </div>

        <div>
          <label>TRL</label>
          <input type="number" className="form-control" {...register("trl", { required: false })} />
        </div>

        <div>
          <label>MRL</label>
          <input type="number" className="form-control" {...register("mrl", { required: false })} />
        </div>

        <div>
          <label>CRL</label>
          <input type="number" className="form-control" {...register("crl", { required: false })} />
        </div>

        <div>
          <label>Grading Criteria</label>
          <textarea className="form-control" {...register("grading_criteria", { required: false })}></textarea>
        </div>

        <div>
          <label>Exit Criteria</label>
          <textarea className="form-control" {...register("exit_criteria", { required: false })}></textarea>
        </div>

        <button type="submit" className="btn btn-primary mt-4">Submit</button>
      </form>
    </main>
  );
};

export default AddProject;

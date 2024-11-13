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
    <main className="form-container">
      <h1>Add New Project</h1>
      <form onSubmit={handleSubmit(onSubmit)} method="POST">
        <div className="form-row">
          <label>Project Title</label>
          <input className="form-control" {...register("project_title", { required: true })} />
        </div>

        <div className="form-row large">
          <label>Scope Description</label>
          <textarea className="form-control" {...register("scope_description", { required: true })}></textarea>
        </div>

        <div className="form-row half">
          <label>Need</label>
          <textarea className="form-control" {...register("need", { required: true })}></textarea>
        </div>

        <div className="form-row half">
          <label>Benefit</label>
          <textarea className="form-control" {...register("benefit", { required: true })}></textarea>
        </div>

        <div className="form-row large">
          <label>Risks and Challenges</label>
          <textarea className="form-control" {...register("risks_challenges", { required: true })}></textarea>
        </div>

        <div className="form-row large">
          <label>NA-115 Strategic Priorities</label>
          <textarea className="form-control" {...register("strategic_priorities")}></textarea>
        </div>

        <div className="form-row large">
          <label>Team Priorities</label>
          <textarea className="form-control" {...register("team_priorities")}></textarea>
        </div>

        <div className="form-row large">
          <label>Program Priorities</label>
          <textarea className="form-control" {...register("program_priorities")}></textarea>
        </div>

        <div className="form-row large">
          <label>Partnership and Collaborations (Internal & External)</label>
          <textarea className="form-control" {...register("partnership_collaborations")}></textarea>
        </div>

        <div className="form-row small">
          <label>FY</label>
          <input type="number" className="form-control" {...register("completion_target_fy", { required: true })} />
        </div>

        <div className="form-row small">
          <label>Funding ($K)</label>
          <input type="number" className="form-control" {...register("funding")} />
        </div>

        <div className="form-row small">
          <label>TRL</label>
          <input type="number" className="form-control" {...register("trl")} />
        </div>

        <div className="form-row small">
          <label>MRL</label>
          <input type="number" className="form-control" {...register("mrl")} />
        </div>

        <div className="form-row small">
          <label>CRL</label>
          <input type="number" className="form-control" {...register("crl")} />
        </div>

        <div className="form-row half">
          <label>Grading Criteria</label>
          <textarea className="form-control" {...register("grading_criteria")}></textarea>
        </div>

        <div className="form-row half">
          <label>Exit Criteria</label>
          <textarea className="form-control" {...register("exit_criteria")}></textarea>
        </div>

        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </main>
  );
};

export default AddProject;



.form-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .form-row {
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
  }
  
  .form-row label {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .form-row input,
  .form-row textarea {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
  }
  
  .form-row.large {
    width: 100%;
  }
  
  .form-row.half {
    width: 48%;
    display: inline-block;
    vertical-align: top;
  }
  
  .form-row.small {
    width: 23%;
    display: inline-block;
    vertical-align: top;
  }
  
  .form-control {
    width: 100%;
  }
  
  .btn {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  
  .btn:hover {
    background-color: #0056b3;
  }
  
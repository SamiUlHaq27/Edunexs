import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faDownload, faEye, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function TeacherAssignments() {
  const [view, setView] = useState<"list" | "create" | "grade">("list");
  
  // Mock Data
  const assignments = [
    { id: 1, title: "Algebra Basics", due: "2024-12-01", submitted: 15, total: 20 },
    { id: 2, title: "Geometry Project", due: "2024-12-10", submitted: 5, total: 20 }
  ];

  const submissions = [
    { id: 101, student: "Ali Khan", file: "homework.pdf", grade: "", status: "Submitted" },
    { id: 102, student: "John Doe", file: "geo_project.docx", grade: "85", status: "Graded" },
  ];

  if (view === "create") {
    return (
      <div className="card settings-container">
        <button className="btn" onClick={() => setView("list")} style={{ marginBottom: '1rem' }}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <h3 className="card-title">Create Assignment</h3>
        <form className="auth-form">
          <label className="auth-label">Title</label>
          <input className="auth-input" placeholder="e.g. Chapter 1 Review" />
          <div style={{ height: '1rem' }} />
          <label className="auth-label">Description</label>
          <textarea className="auth-input" style={{ minHeight: '100px', fontFamily: 'inherit' }}></textarea>
          <div style={{ height: '1rem' }} />
          <label className="auth-label">Due Date</label>
          <input type="date" className="auth-input" />
          <div style={{ height: '1rem' }} />
          <label className="auth-label">Total Marks</label>
          <input type="number" className="auth-input" placeholder="100" />
          <div style={{ height: '1.5rem' }} />
          <button className="btn btn-primary">Publish Assignment</button>
        </form>
      </div>
    );
  }

  if (view === "grade") {
    return (
      <div>
        <div className="toolbar">
           <h3>Grading: Algebra Basics</h3>
           <button className="btn" onClick={() => setView("list")}><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Student</th><th>Submission</th><th>Status</th><th>Grade</th><th>Actions</th></tr></thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub.id}>
                  <td>{sub.student}</td>
                  <td><a href="#" className="link"><FontAwesomeIcon icon={faDownload} /> {sub.file}</a></td>
                  <td><span className={`status-badge ${sub.status === 'Graded' ? 'status-active' : 'status-warning'}`}>{sub.status}</span></td>
                  <td>
                    <input className="auth-input" style={{ width: '60px', padding: '4px' }} defaultValue={sub.grade} placeholder="-" />
                  </td>
                  <td><button className="btn btn-primary" style={{ padding: '4px 12px' }}>Save</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="toolbar">
        <h3>Assignments</h3>
        <button className="btn btn-primary" onClick={() => setView("create")}>
           <FontAwesomeIcon icon={faPlus} /> Create New
        </button>
      </div>
      <div className="card-grid">
        {assignments.map(a => (
          <div key={a.id} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <h4 style={{ margin: 0 }}>{a.title}</h4>
               <span style={{ fontSize: '0.8rem', color: '#666' }}>Due: {a.due}</span>
            </div>
            <p style={{ margin: '1rem 0', color: '#4b5563' }}>
               {a.submitted} / {a.total} Submissions
            </p>
            <div style={{ width: '100%', background: '#e5e7eb', height: '6px', borderRadius: '3px', marginBottom: '1rem' }}>
               <div style={{ width: `${(a.submitted/a.total)*100}%`, background: '#0066ff', height: '100%', borderRadius: '3px' }}></div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setView("grade")}>
               <FontAwesomeIcon icon={faEye} /> View & Grade
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
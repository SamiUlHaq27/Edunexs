import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFileAlt, faPlus, faArrowLeft, faEye, faCloudUploadAlt, faSave, faAlignLeft 
} from "@fortawesome/free-solid-svg-icons";

export default function TeacherAssignments() {
  const [currentAction, setCurrentAction] = useState<"list" | "create" | "grade">("list");
  const [file, setFile] = useState<File | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const submissions = [
    { id: 1, student: "Ali Hashmi", rollNo: "BCS-786", file: "db_diagram.pdf", date: "2 hours ago", status: "Pending" },
    { id: 2, student: "Zain Ahmed", rollNo: "BCS-787", file: "assignment_1.docx", date: "Yesterday", status: "Graded" }
  ];

  // --- CREATE VIEW ---
  if (currentAction === "create") {
    return (
      <div>
        <button className="btn" onClick={() => setCurrentAction("list")} style={{ marginBottom: '1rem' }}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to List
        </button>
        
        <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Publish New Assignment</h3>
        
        <div className="modal-form-grid" style={{ marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="auth-label">Assignment Title</label>
            <input className="auth-input" placeholder="e.g. Final Research Project" />
          </div>

          {/* Naya Description Box yahan add kiya hai */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="auth-label">Assignment Description / Instructions</label>
            <textarea 
              className="auth-input" 
              placeholder="Write detailed instructions here for students..." 
              rows={5} 
              style={{ padding: '12px', lineHeight: '1.5', resize: 'vertical' }}
            />
          </div>
          
          <div className="password-row" style={{ marginTop: '0.5rem' }}>
            <div>
              <label className="auth-label">Total Marks</label>
              <input className="auth-input" type="number" placeholder="100" />
            </div>
            <div>
              <label className="auth-label">Due Date</label>
              <input className="auth-input" type="date" />
            </div>
          </div>
        </div>

        <h4 style={{ marginBottom: '1rem' }}>Upload Reference Material</h4>
        <div className="upload-zone">
          <input type="file" id="file-upload" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
            <FontAwesomeIcon icon={faCloudUploadAlt} size="3x" style={{ marginBottom: '1rem', color: '#9ca3af' }} />
            <p style={{ fontWeight: 'bold' }}>{file ? file.name : "Click to upload reference file"}</p>
            <p style={{ fontSize: '0.8rem' }}>PDF, DOCX, or Images</p>
          </label>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={() => { alert("Assignment Created!"); setCurrentAction("list"); }}>
            Create & Post Assignment
          </button>
        </div>
      </div>
    );
  }

  // --- GRADE VIEW ---
  if (currentAction === "grade" && selectedSubmission) {
    return (
      <div>
        <button className="btn" onClick={() => setCurrentAction("list")} style={{ marginBottom: '1rem' }}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Submissions
        </button>
        <div className="student-header-card" style={{ background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <h3 style={{ margin: 0 }}>Grading: {selectedSubmission.student}</h3>
          <p style={{ margin: '5px 0 0 0' }}>Submitted File: <span style={{ color: '#0066ff', textDecoration: 'underline', cursor: 'pointer' }}>{selectedSubmission.file}</span></p>
        </div>
        <div className="modal-form-grid">
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="auth-label">Obtained Marks</label>
            <input type="number" className="auth-input" placeholder="Enter marks..." />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="auth-label">Feedback / Remarks</label>
            <textarea className="auth-input" placeholder="Write your feedback..." rows={4} style={{ padding: '12px' }} />
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={() => { alert("Grade Saved!"); setCurrentAction("list"); }}>
            <FontAwesomeIcon icon={faSave} /> Save Grades & Remarks
          </button>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h4 className="card-title">Assignment Submissions</h4>
        <button className="btn btn-primary" onClick={() => setCurrentAction("create")}>
          <FontAwesomeIcon icon={faPlus} /> Create New
        </button>
      </div>
      <div className="activity-list">
        {submissions.map((sub) => (
          <div key={sub.id} className="activity-item" style={{ alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>{sub.student} <span style={{ fontSize: '0.8rem', color: '#888' }}>({sub.rollNo})</span></div>
              <div style={{ fontSize: '0.85rem', color: '#0066ff' }}>
                <FontAwesomeIcon icon={faFileAlt} /> {sub.file} • {sub.date}
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => { setSelectedSubmission(sub); setCurrentAction("grade"); }}>
              <FontAwesomeIcon icon={faEye} /> View & Grade
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
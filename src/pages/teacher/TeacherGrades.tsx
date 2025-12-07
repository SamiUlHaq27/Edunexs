import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTable, faPlusCircle } from "@fortawesome/free-solid-svg-icons";

interface GradeEntry {
  studentId: number;
  studentName: string;
  marks: number | string;
}

export default function TeacherGrades() {
  const [view, setView] = useState<"book" | "input">("book");
  
  // Mock Data
  const [students, setStudents] = useState<GradeEntry[]>([
    { studentId: 1, studentName: "Ali Khan", marks: "" },
    { studentId: 2, studentName: "Sara Ahmed", marks: "" },
    { studentId: 3, studentName: "John Doe", marks: "" },
  ]);

  const handleMarkChange = (id: number, val: string) => {
    setStudents(students.map(s => s.studentId === id ? { ...s, marks: val } : s));
  };

  return (
    <div>
      <div className="tabs" style={{ maxWidth: '300px', margin: '0 0 1.5rem 0' }}>
        <button className={`tab ${view === 'book' ? 'tab-active' : ''}`} onClick={() => setView("book")}>Gradebook</button>
        <button className={`tab ${view === 'input' ? 'tab-active' : ''}`} onClick={() => setView("input")}>Input Grades</button>
      </div>

      {view === "input" ? (
        <div className="card settings-container">
          <h3 className="card-title"><FontAwesomeIcon icon={faPlusCircle} /> Manual Grade Entry</h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>Enter marks for external exams or offline assessments.</p>
          
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
             <div>
                <label className="auth-label">Exam/Assessment Title</label>
                <input className="auth-input" placeholder="e.g. Mid-Term Written Exam" />
             </div>
             <div>
                <label className="auth-label">Total Marks</label>
                <input className="auth-input" type="number" placeholder="100" />
             </div>
          </div>

          <table className="data-table">
            <thead><tr><th>Student Name</th><th>Marks Obtained</th></tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s.studentId}>
                  <td>{s.studentName}</td>
                  <td>
                    <input 
                      type="number" 
                      className="grade-input" 
                      value={s.marks} 
                      onChange={(e) => handleMarkChange(s.studentId, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button className="btn btn-primary"><FontAwesomeIcon icon={faSave} /> Save Grades</button>
          </div>
        </div>
      ) : (
        <div className="card">
           <div className="teacher-toolbar" style={{ border: 'none', padding: 0, background: 'transparent' }}>
             <h3 className="card-title"><FontAwesomeIcon icon={faTable} /> Full Gradebook: Mathematics 101</h3>
             <button className="btn btn-primary" style={{ fontSize: '0.8rem' }}>Export CSV</button>
           </div>
           
           <div className="gradebook-container">
             <table className="gradebook-table">
               <thead>
                 <tr>
                   <th style={{ position: 'sticky', left: 0, background: '#f3f4f6', zIndex: 10 }}>Student</th>
                   <th>Assign 1 (10)</th>
                   <th>Assign 2 (20)</th>
                   <th>Quiz 1 (10)</th>
                   <th>Mid-Term (100)</th>
                   <th>Total (%)</th>
                 </tr>
               </thead>
               <tbody>
                 <tr>
                   <td style={{ position: 'sticky', left: 0, background: '#fff', fontWeight: 'bold' }}>Ali Khan</td>
                   <td>8</td><td>18</td><td>9</td><td>85</td>
                   <td><span className="status-badge status-active">88%</span></td>
                 </tr>
                 <tr>
                   <td style={{ position: 'sticky', left: 0, background: '#fff', fontWeight: 'bold' }}>Sara Ahmed</td>
                   <td>9</td><td>19</td><td>10</td><td>92</td>
                   <td><span className="status-badge status-active">94%</span></td>
                 </tr>
               </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
}
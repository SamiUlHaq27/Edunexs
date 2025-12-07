import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faClock, faCalendarAlt, faSearch } from "@fortawesome/free-solid-svg-icons";

interface Student {
  id: number;
  name: string;
  status: "Present" | "Absent" | "Late" | null;
}

export default function TeacherAttendance() {
  const [view, setView] = useState<"mark" | "report">("mark");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Mock Data
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "Ali Khan", status: "Present" },
    { id: 2, name: "Sara Ahmed", status: null },
    { id: 3, name: "John Doe", status: "Absent" },
  ]);

  const updateStatus = (id: number, status: "Present" | "Absent" | "Late") => {
    setStudents(students.map(s => s.id === id ? { ...s, status } : s));
  };

  return (
    <div>
      <div className="tabs" style={{ maxWidth: '400px', margin: '0 0 1.5rem 0' }}>
        <button className={`tab ${view === 'mark' ? 'tab-active' : ''}`} onClick={() => setView("mark")}>Mark Attendance</button>
        <button className={`tab ${view === 'report' ? 'tab-active' : ''}`} onClick={() => setView("report")}>View Reports</button>
      </div>

      {view === "mark" ? (
        <div className="card settings-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="card-title">Daily Attendance</h3>
            <div className="input-with-icon" style={{ margin: 0, width: '200px' }}>
              <span className="input-icon"><FontAwesomeIcon icon={faCalendarAlt} /></span>
              <input type="date" className="auth-input" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Student Name</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: '500' }}>{s.name}</td>
                    <td>
                      <span className={`status-badge ${s.status === 'Present' ? 'status-active' : s.status === 'Absent' ? 'status-inactive' : 'status-warning'}`}>
                        {s.status || "Not Marked"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-icon" onClick={() => updateStatus(s.id, "Present")} title="Present" style={{ color: '#10b981' }}>
                           <FontAwesomeIcon icon={faCheck} />
                        </button>
                        <button className="btn btn-icon" onClick={() => updateStatus(s.id, "Late")} title="Late" style={{ color: '#f59e0b' }}>
                           <FontAwesomeIcon icon={faClock} />
                        </button>
                        <button className="btn btn-icon" onClick={() => updateStatus(s.id, "Absent")} title="Absent" style={{ color: '#ef4444' }}>
                           <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
             <button className="btn btn-primary">Save Attendance</button>
          </div>
        </div>
      ) : (
        <div className="card settings-container">
           <h3 className="card-title">Attendance Report</h3>
           <div className="form-grid" style={{ marginBottom: '1rem' }}>
              <div>
                 <label className="auth-label">Select Course</label>
                 <select className="auth-input"><option>Mathematics 101</option></select>
              </div>
              <div>
                 <label className="auth-label">Month</label>
                 <input type="month" className="auth-input" />
              </div>
           </div>
           
           {/* Mock Chart Visualization */}
           <div style={{ height: '200px', background: '#f9fafb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc' }}>
              <p style={{ color: '#666' }}>Attendance Chart Visualization Here</p>
           </div>
        </div>
      )}
    </div>
  );
}
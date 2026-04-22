import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faChartPie,
  faSearch,
  faArrowLeft,
  faSave,
  faFileDownload,
  faCalendarAlt,
  faUserGraduate
} from "@fortawesome/free-solid-svg-icons";

// --- 1. Internal Layout Component ---
const TeacherLayout = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {children}
    </div>
  </div>
);

// Student Interface Updated to include History
interface Student {
  id: number;
  name: string;
  rollNo: string;
  avatar: string;
  status: string;
  total: number;
  attended: number;
  history: { [key: number]: "P" | "A" | "-" }; // Added this to fix errors
}

export default function TeacherAttendance() {
  const [view, setView] = useState<"mark" | "report">("mark");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mahine ke total din logic
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  // Updated Mock Student Data with History
  const [students, setStudents] = useState<Student[]>([
    { 
      id: 1, name: "Haider Ali Hashmi", rollNo: "BCS-786", avatar: "https://i.pravatar.cc/150?img=11", status: "present", total: 30, attended: 28,
      history: { 1: "P", 2: "P", 3: "A", 4: "P", 5: "P", 8: "P" } 
    },
    { 
      id: 2, name: "Zain Ahmed", rollNo: "BCS-787", avatar: "https://i.pravatar.cc/150?img=12", status: "absent", total: 30, attended: 22,
      history: { 1: "A", 2: "A", 3: "P", 4: "P", 5: "A", 8: "A" }
    },
    { 
      id: 3, name: "Sara Khan", rollNo: "BCS-790", avatar: "https://i.pravatar.cc/150?img=5", status: "present", total: 30, attended: 25,
      history: { 1: "P", 2: "P", 3: "P", 4: "P", 5: "P", 8: "P" }
    },
  ]);

  const updateStatus = (id: number, newStatus: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TeacherLayout>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .attendance-container { animation: fadeIn 0.4s ease-out; }
        .status-btn { border: none; width: 40px; height: 40px; border-radius: 10px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-primary { background: #3b82f6; color: white; border: none; cursor: pointer; padding: 12px 24px; border-radius: 12px; font-weight: bold; }
        .auth-input { width: 100%; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; outline: none; }
        
        /* Report Table Styles */
        .report-wrapper { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; margin-top: 20px; }
        .scroll-container { overflow-x: auto; width: 100%; }
        .report-table { width: 100%; border-collapse: collapse; min-width: 1000px; }
        .report-table th, .report-table td { border-bottom: 1px solid #f1f5f9; padding: 12px; text-align: center; font-size: 0.85rem; }
        .sticky-col { position: sticky; left: 0; background: white; z-index: 10; border-right: 2px solid #f1f5f9; text-align: left !important; min-width: 200px; }
        .sticky-header { position: sticky; left: 0; background: #f8fafc !important; z-index: 11; }
        
        .status-p { color: #10b981; font-weight: 800; background: #f0fdf4; border-radius: 4px; padding: 4px; }
        .status-a { color: #ef4444; font-weight: 800; background: #fef2f2; border-radius: 4px; padding: 4px; }
        .status-none { color: #cbd5e1; }
      `}</style>

      <div className="attendance-container">
        {view === "mark" ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Mark Attendance</h2>
                <p style={{ color: '#64748b', marginTop: '4px' }}>Computer Science 101 • Section A</p>
              </div>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faSave} /> Save Attendance
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ position: 'relative' }}>
                <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="text" placeholder="Search student..." className="auth-input" style={{ paddingLeft: '45px' }} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '12px', textAlign: 'center', border: '1px solid #d1fae5' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#059669' }}>{students.filter(s => s.status === 'present').length}</div>
                <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: '700' }}>PRESENT</div>
              </div>
              <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '12px', textAlign: 'center', border: '1px solid #fee2e2' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#dc2626' }}>{students.filter(s => s.status === 'absent').length}</div>
                <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: '700' }}>ABSENT</div>
              </div>
              <button onClick={() => setView("report")} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}>
                <FontAwesomeIcon icon={faChartPie} style={{ marginRight: '8px' }} /> Reports
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredStudents.map(student => (
                <div key={student.id} style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={student.avatar} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} alt="avatar" />
                    <div>
                      <h4 style={{ margin: 0, fontWeight: '700', color: '#1e293b' }}>{student.name}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Roll: {student.rollNo}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => updateStatus(student.id, 'present')} className="status-btn" style={{ background: student.status === 'present' ? '#10b981' : '#f1f5f9', color: student.status === 'present' ? 'white' : '#64748b' }}><FontAwesomeIcon icon={faCheck} /></button>
                    <button onClick={() => updateStatus(student.id, 'absent')} className="status-btn" style={{ background: student.status === 'absent' ? '#ef4444' : '#f1f5f9', color: student.status === 'absent' ? 'white' : '#64748b' }}><FontAwesomeIcon icon={faTimes} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* --- FULL ATTENDANCE REPORT VIEW --- */
          <div className="report-view-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <button onClick={() => setView("mark")} style={{ background: 'none', color: '#3b82f6', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faArrowLeft} /> Back to Marking
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: 'white', padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FontAwesomeIcon icon={faCalendarAlt} color="#3b82f6" />
                  <span style={{ fontWeight: '700' }}>April 2026</span>
                </div>
                <button className="btn-primary" style={{ fontSize: '0.85rem' }}>
                  <FontAwesomeIcon icon={faFileDownload} /> Export PDF
                </button>
              </div>
            </div>

            <div className="report-wrapper">
              <div className="scroll-container">
                <table className="report-table">
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th className="sticky-col sticky-header">Students</th>
                      {daysInMonth.map(day => (
                        <th key={day} style={{ minWidth: '40px' }}>{day}</th>
                      ))}
                      <th style={{ background: '#eff6ff', color: '#1e40af' }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      // Percentage Calculation logic
                      const historyValues = Object.values(student.history);
                      const totalMarked = historyValues.filter(v => v !== "-").length;
                      const presentCount = historyValues.filter(v => v === "P").length;
                      const percentage = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

                      return (
                        <tr key={student.id}>
                          <td className="sticky-col">
                            <div style={{ fontWeight: '700', color: '#1e293b' }}>{student.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{student.rollNo}</div>
                          </td>
                          {daysInMonth.map(day => (
                            <td key={day}>
                              <span className={
                                student.history[day] === "P" ? "status-p" : 
                                student.history[day] === "A" ? "status-a" : "status-none"
                              }>
                                {student.history[day] || "-"}
                              </span>
                            </td>
                          ))}
                          <td style={{ fontWeight: '800', color: percentage < 75 ? '#ef4444' : '#10b981' }}>
                            {percentage}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '20px', fontSize: '0.85rem', color: '#64748b' }}>
              <div><b style={{ color: '#10b981' }}>P</b> : Present</div>
              <div><b style={{ color: '#ef4444' }}>A</b> : Absent</div>
              <div><b style={{ color: '#cbd5e1' }}>-</b> : No Lecture</div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
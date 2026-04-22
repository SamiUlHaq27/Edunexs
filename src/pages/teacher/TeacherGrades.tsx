import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faPlus,
  faFileExport,
  faKeyboard,
  faMicrochip,
  faBookOpen,
  faCheckDouble,
  faUserPlus,
  faTimes
} from "@fortawesome/free-solid-svg-icons";

const TeacherLayout = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {children}
    </div>
  </div>
);

export default function TeacherGradebook() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // New Student State for Manual Entry
  const [newStudent, setNewStudent] = useState({
    name: "", rollNo: "", assignment: 0, quiz: 0, exam: 0
  });

  const [students, setStudents] = useState([
    { id: 1, name: "Haider Ali Hashmi", rollNo: "BCS-786", avatar: "https://i.pravatar.cc/150?img=11", assignment: 18, quiz: 9, exam: 65 },
    { id: 2, name: "Zain Ahmed", rollNo: "BCS-787", avatar: "https://i.pravatar.cc/150?img=12", assignment: 15, quiz: 7, exam: 55 },
  ]);

  const handleUpdate = (id: number, field: string, val: string) => {
    const value = parseInt(val) || 0;
    setStudents(students.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addNewRecord = () => {
    if(!newStudent.name || !newStudent.rollNo) return alert("Please fill basic info");
    
    const record = {
      ...newStudent,
      id: Date.now(),
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`
    };
    setStudents([record, ...students]);
    setNewStudent({ name: "", rollNo: "", assignment: 0, quiz: 0, exam: 0 });
    setShowAddForm(false);
  };

  return (
    <TeacherLayout>
      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .add-form-container { animation: slideDown 0.3s ease-out; background: white; padding: 1.5rem; border-radius: 20px; border: 2px dashed #cbd5e1; margin-bottom: 2rem; }
        .score-card { background: white; padding: 1.2rem; borderRadius: 20px; border: 1px solid #f1f5f9; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s; }
        .score-input { width: 50px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 10px; text-align: center; font-weight: 700; background: #f8fafc; outline: none; }
        .manual-input { padding: 10px; border: 1px solid #e2e8f0; border-radius: 10px; outline: none; width: 100%; }
        .btn-add { background: #3b82f6; color: white; border: none; padding: 10px 20px; borderRadius: 10px; cursor: pointer; fontWeight: bold; }
      `}</style>

      <div className="gradebook-container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Gradebook</h2>
            <p style={{ color: '#64748b', marginTop: '4px' }}>Marks Management • Fall 2026</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ background: showAddForm ? '#f43f5e' : '#0f172a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <FontAwesomeIcon icon={showAddForm ? faTimes : faUserPlus} style={{ marginRight: '8px' }} /> 
            {showAddForm ? "Cancel" : "Manual Entry"}
          </button>
        </div>

        {/* --- MANUAL ENTRY FORM --- */}
        {showAddForm && (
          <div className="add-form-container">
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>Add New Student Record</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 80px 80px 120px', gap: '10px', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b' }}>NAME</label>
                <input className="manual-input" placeholder="Full Name" value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b' }}>ROLL NO</label>
                <input className="manual-input" placeholder="BCS-000" value={newStudent.rollNo} onChange={(e) => setNewStudent({...newStudent, rollNo: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b' }}>ASGN</label>
                <input type="number" className="manual-input" value={newStudent.assignment} onChange={(e) => setNewStudent({...newStudent, assignment: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b' }}>QUIZ</label>
                <input type="number" className="manual-input" value={newStudent.quiz} onChange={(e) => setNewStudent({...newStudent, quiz: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b' }}>EXAM</label>
                <input type="number" className="manual-input" value={newStudent.exam} onChange={(e) => setNewStudent({...newStudent, exam: parseInt(e.target.value) || 0})} />
              </div>
              <button className="btn-add" onClick={addNewRecord}>Save Record</button>
            </div>
          </div>
        )}

        {/* Search & Export */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative' }}>
            <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search student marks..." 
              style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faFileExport} style={{ marginRight: '8px' }} /> Export Report
          </button>
        </div>

        {/* Student Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(student => {
            const total = student.assignment + student.quiz + student.exam;
            return (
              <div key={student.id} className="score-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <img src={student.avatar} style={{ width: '45px', height: '45px', borderRadius: '12px', objectFit: 'cover' }} alt="avatar" />
                  <div>
                    <h4 style={{ margin: 0, fontWeight: '800', color: '#1e293b', fontSize: '0.95rem' }}>{student.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{student.rollNo}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', flex: 2, justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 'bold' }}>ASGN</div>
                    <input type="number" value={student.assignment} onChange={(e) => handleUpdate(student.id, 'assignment', e.target.value)} className="score-input" />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 'bold' }}>QUIZ</div>
                    <input type="number" value={student.quiz} onChange={(e) => handleUpdate(student.id, 'quiz', e.target.value)} className="score-input" />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 'bold' }}>EXAM</div>
                    <input type="number" value={student.exam} onChange={(e) => handleUpdate(student.id, 'exam', e.target.value)} className="score-input" />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'flex-end' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 'bold', color: '#94a3b8' }}>TOTAL</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#3b82f6' }}>{total}</div>
                  </div>
                  <div style={{ width: '35px', height: '35px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.8rem', color: '#1e293b' }}>
                    {total >= 90 ? 'A+' : total >= 80 ? 'A' : total >= 70 ? 'B' : 'C'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TeacherLayout>
  );
}
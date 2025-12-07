import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faUserGraduate, faUsers, faArrowLeft, faEllipsisH } from "@fortawesome/free-solid-svg-icons";

interface Student {
  id: number;
  name: string;
  email: string;
  rollNo: string;
  group?: string;
}

export default function StudentManagement() {
  const [activeTab, setActiveTab] = useState<"students" | "groups">("students");
  const [view, setView] = useState<"list" | "form">("list");
  
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "Student A", email: "std1@school.com", rollNo: "S-101", group: "Class 10-A" },
    { id: 2, name: "Student B", email: "std2@school.com", rollNo: "S-102", group: "Class 10-A" }
  ]);
  const [groups, setGroups] = useState<string[]>(["Class 10-A", "Class 9-B"]);
  
  const [formData, setFormData] = useState({ name: "", email: "", rollNo: "", group: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setStudents(students.map(s => s.id === editingId ? { ...s, ...formData } : s));
    } else {
      setStudents([...students, { id: Date.now(), ...formData }]);
    }
    setView("list");
    setEditingId(null);
    setFormData({ name: "", email: "", rollNo: "", group: "" });
  };

  const addGroup = () => {
    const name = prompt("Enter new Group Name:");
    if (name) setGroups([...groups, name]);
  };

  if (view === "form") {
    return (
      <div className="card settings-container">
        <button className="btn" onClick={() => setView("list")} style={{marginBottom: '1rem'}}><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
        <h3 className="card-title">{editingId ? "Update Student" : "Add Student"}</h3>
        <form onSubmit={handleSaveStudent} className="auth-form">
          <label className="auth-label">Full Name</label>
          <input className="auth-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <div style={{height: '1rem'}} />
          <label className="auth-label">Roll No</label>
          <input className="auth-input" required value={formData.rollNo} onChange={e => setFormData({...formData, rollNo: e.target.value})} />
          <div style={{height: '1rem'}} />
          <label className="auth-label">Email</label>
          <input className="auth-input" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <div style={{height: '1rem'}} />
          <label className="auth-label">Assign to Group (Optional)</label>
          <select className="auth-input" value={formData.group} onChange={e => setFormData({...formData, group: e.target.value})}>
            <option value="">No Group</option>
            {groups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <div style={{height: '1.5rem'}} />
          <button type="submit" className="btn btn-primary">{editingId ? "Update" : "Add Student"}</button>
        </form>
      </div>
    );
  }

  return (
    <div onClick={() => setOpenMenuId(null)}>
      <div className="tabs" style={{ maxWidth: '400px', margin: '0 0 1.5rem 0' }}>
        <button className={`tab ${activeTab === 'students' ? 'tab-active' : ''}`} onClick={() => setActiveTab("students")}>Students</button>
        <button className={`tab ${activeTab === 'groups' ? 'tab-active' : ''}`} onClick={() => setActiveTab("groups")}>Groups</button>
      </div>

      {activeTab === "students" ? (
        <>
          <div className="toolbar">
            <h3>All Students</h3>
            <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData({name:"",email:"",rollNo:"",group:""}); setView("form"); }}>
               <FontAwesomeIcon icon={faPlus} /> Add Student
            </button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Roll No</th><th>Name</th><th>Email</th><th>Group</th><th>Actions</th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td style={{fontFamily:'monospace'}}>{s.rollNo}</td>
                    <td><FontAwesomeIcon icon={faUserGraduate} style={{marginRight:'8px', color:'#8b5cf6'}}/> {s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.group ? <span className="assignment-tag">{s.group}</span> : '-'}</td>
                    <td>
                      <div className="action-menu-wrapper" onClick={(e) => e.stopPropagation()}>
                        <button className="action-menu-btn" onClick={() => toggleMenu(s.id)}>
                          <FontAwesomeIcon icon={faEllipsisH} />
                        </button>
                        {openMenuId === s.id && (
                          <div className="action-dropdown">
                            <button className="dropdown-item" onClick={() => {
                              setEditingId(s.id); 
                              setFormData({name: s.name, email: s.email, rollNo: s.rollNo, group: s.group || ""}); 
                              setView("form");
                              setOpenMenuId(null);
                            }}>
                              <FontAwesomeIcon icon={faEdit} fixedWidth /> Edit
                            </button>
                            <button className="dropdown-item danger" onClick={() => {
                              setStudents(students.filter(std => std.id !== s.id));
                              setOpenMenuId(null);
                            }}>
                              <FontAwesomeIcon icon={faTrash} fixedWidth /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="toolbar">
            <h3>Student Groups</h3>
            <button className="btn btn-primary" onClick={addGroup}><FontAwesomeIcon icon={faUsers} /> Create Group</button>
          </div>
          <div className="card-grid">
            {groups.map(group => (
               <div key={group} className="stat-card">
                 <div className="group-header">
                   <h3 className="card-title" style={{margin:0, color:'#333'}}>{group}</h3>
                   <button className="btn action-btn btn-delete" onClick={() => setGroups(groups.filter(g => g !== group))}><FontAwesomeIcon icon={faTrash}/></button>
                 </div>
                 <p className="auth-subtitle" style={{margin:0}}>
                   {students.filter(s => s.group === group).length} Students
                 </p>
               </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faBookOpen, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

interface Course {
  id: number;
  title: string;
  code: string;
  status: "Active" | "Inactive";
}

export default function CourseManagement() {
  const [view, setView] = useState<"list" | "form">("list");
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, title: "Introduction to Computer Science", code: "CS101", status: "Active" },
    { id: 2, title: "Advanced Mathematics", code: "MAT201", status: "Inactive" }
  ]);
  const [formData, setFormData] = useState({ title: "", code: "", status: "Active" as "Active" | "Inactive" });
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setCourses(courses.map(c => c.id === editingId ? { ...c, ...formData } : c));
    } else {
      setCourses([...courses, { id: Date.now(), ...formData }]);
    }
    setView("list");
    setEditingId(null);
    setFormData({ title: "", code: "", status: "Active" });
  };

  if (view === "form") {
    return (
       <div className="card settings-container">
         <button className="btn" onClick={() => setView("list")} style={{marginBottom: '1rem'}}><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
         <h3 className="card-title">{editingId ? "Update Course" : "Create Course"}</h3>
         <form onSubmit={handleSave} className="auth-form">
           <label className="auth-label">Course Title</label>
           <input className="auth-input" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
           <div style={{height:'1rem'}}/>
           <label className="auth-label">Course Code</label>
           <input className="auth-input" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
           <div style={{height:'1rem'}}/>
           <label className="auth-label">Status</label>
           <select className="auth-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
             <option value="Active">Active</option>
             <option value="Inactive">Inactive</option>
           </select>
           <div style={{height:'1.5rem'}}/>
           <button type="submit" className="btn btn-primary">{editingId ? "Update" : "Create"}</button>
         </form>
       </div>
    );
  }

  return (
    <div>
      <div className="toolbar">
        <h3>Courses</h3>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData({title:"",code:"",status:"Active"}); setView("form"); }}>
           <FontAwesomeIcon icon={faPlus} /> Add Course
        </button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Code</th><th>Title</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id}>
                <td style={{fontFamily:'monospace', fontWeight:'bold'}}>{c.code}</td>
                <td><FontAwesomeIcon icon={faBookOpen} style={{marginRight:'8px', color:'#f59e0b'}}/> {c.title}</td>
                <td>
                  <span className={`status-badge ${c.status === "Active" ? "status-active" : "status-inactive"}`}>
                    {c.status}
                  </span>
                </td>
                <td>
                  <button className="btn action-btn" onClick={() => { setEditingId(c.id); setFormData(c); setView("form"); }}><FontAwesomeIcon icon={faEdit}/></button>
                  <button className="btn action-btn btn-delete" onClick={() => setCourses(courses.filter(i => i.id !== c.id))}><FontAwesomeIcon icon={faTrash}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faChalkboardTeacher, faArrowLeft, faEllipsisH } from "@fortawesome/free-solid-svg-icons";

interface Teacher {
  id: number;
  name: string;
  email: string;
  subject: string;
}

export default function TeacherManagement() {
  const [view, setView] = useState<"list" | "form">("list");
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: 1, name: "Mr. Smith", email: "smith@school.com", subject: "Mathematics" }
  ]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "" });
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingId(teacher.id);
    setFormData({ name: teacher.name, email: teacher.email, subject: teacher.subject });
    setView("form");
    setOpenMenuId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setTeachers(teachers.map(t => t.id === editingId ? { ...t, ...formData } : t));
    } else {
      setTeachers([...teachers, { id: Date.now(), ...formData }]);
    }
    setView("list");
    setEditingId(null);
    setFormData({ name: "", email: "", subject: "" });
  };

  if (view === "form") {
    return (
      <div className="card settings-container">
        <button className="btn" onClick={() => setView("list")} style={{marginBottom: '1rem'}}><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
        <h3 className="card-title">{editingId ? "Update Teacher" : "Add Teacher"}</h3>
        <form onSubmit={handleSave} className="auth-form">
          <label className="auth-label">Full Name</label>
          <input className="auth-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <div style={{height: '1rem'}} />
          <label className="auth-label">Email</label>
          <input className="auth-input" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <div style={{height: '1rem'}} />
          <label className="auth-label">Specialization/Subject</label>
          <input className="auth-input" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
          <div style={{height: '1.5rem'}} />
          <button type="submit" className="btn btn-primary">{editingId ? "Update" : "Create"}</button>
        </form>
      </div>
    );
  }

  return (
    <div onClick={() => setOpenMenuId(null)}>
      <div className="toolbar">
        <h3>Teachers</h3>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData({name:"", email:"", subject:""}); setView("form"); }}>
           <FontAwesomeIcon icon={faPlus} /> Add Teacher
        </button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Actions</th></tr></thead>
          <tbody>
            {teachers.map(t => (
              <tr key={t.id}>
                <td><FontAwesomeIcon icon={faChalkboardTeacher} style={{marginRight: '8px', color: '#10b981'}}/> {t.name}</td>
                <td>{t.email}</td>
                <td>{t.subject}</td>
                <td>
                  <div className="action-menu-wrapper" onClick={(e) => e.stopPropagation()}>
                    <button className="action-menu-btn" onClick={() => toggleMenu(t.id)}>
                       <FontAwesomeIcon icon={faEllipsisH} />
                    </button>
                    {openMenuId === t.id && (
                      <div className="action-dropdown">
                        <button className="dropdown-item" onClick={() => handleEdit(t)}>
                          <FontAwesomeIcon icon={faEdit} fixedWidth /> Edit
                        </button>
                        <button 
                          className="dropdown-item danger" 
                          onClick={() => {
                            setTeachers(teachers.filter(teacher => teacher.id !== t.id));
                            setOpenMenuId(null);
                          }}
                        >
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
    </div>
  );
}
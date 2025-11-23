import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faTrash, faUserShield, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

interface Admin {
  id: number;
  name: string;
  email: string;
}

export default function AdminManagement() {
  const [view, setView] = useState<"list" | "create">("list");
  const [admins, setAdmins] = useState<Admin[]>([
    { id: 1, name: "Admin One", email: "admin1@school.com" }
  ]);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setAdmins([...admins, { id: Date.now(), name: formData.name, email: formData.email }]);
    setView("list");
  };

  if (view === "create") {
    return (
      <div className="card settings-container">
        <button className="btn" onClick={() => setView("list")} style={{marginBottom: '1rem'}}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <h3 className="card-title">Add Institution Admin</h3>
        <p style={{marginBottom: '1rem', color: '#666'}}>This user will have full administrative access.</p>
        <form onSubmit={handleCreate} className="auth-form">
          <label className="auth-label">Full Name</label>
          <input className="auth-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <div style={{height: '1rem'}} />
          <label className="auth-label">Email</label>
          <input className="auth-input" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <div style={{height: '1rem'}} />
          <label className="auth-label">Password</label>
          <input className="auth-input" type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          <div style={{height: '1.5rem'}} />
          <button type="submit" className="btn btn-primary">Create Admin</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="toolbar">
        <h3>Institution Admins</h3>
        <button className="btn btn-primary" onClick={() => setView("create")}><FontAwesomeIcon icon={faPlus} /> Add Admin</button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin.id}>
                <td><FontAwesomeIcon icon={faUserShield} style={{marginRight: '8px', color: '#0066ff'}}/> {admin.name}</td>
                <td>{admin.email}</td>
                <td>
                  <button className="btn action-btn btn-delete" onClick={() => setAdmins(admins.filter(a => a.id !== admin.id))}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
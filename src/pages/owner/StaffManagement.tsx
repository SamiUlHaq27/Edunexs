import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, faSearch, faEdit, faTrash, faBan, faCheckCircle, 
  faEnvelope, faLock, faUserTie, faArrowLeft
} from "@fortawesome/free-solid-svg-icons";

// Mock Data Interface
interface StaffMember {
  id: number;
  username: string;
  name: string;
  role: string;
  isActive: boolean;
  email?: string;
}

const MOCK_STAFF: StaffMember[] = [
  { id: 1, username: "EDU004_staff001", name: "Ali Khan", role: "Teacher", isActive: true, email: "ali@edu.com" },
  { id: 2, username: "EDU004_staff002", name: "Sara Ahmed", role: "Admin", isActive: false, email: "sara@edu.com" },
];

export default function StaffManagement(): React.JSX.Element {
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [staffList, setStaffList] = useState<StaffMember[]>(MOCK_STAFF);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [search, setSearch] = useState("");

  // Handlers
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      setStaffList(staffList.filter((s) => s.id !== id));
    }
  };

  const toggleStatus = (id: number) => {
    setStaffList(staffList.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Staff saved (Simulation)");
    setView("list");
  };

  // --- Sub-component: Staff Form ---
  if (view === "create" || (view === "edit" && selectedStaff)) {
    return (
      <div className="card settings-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button className="btn" onClick={() => setView("list")}><FontAwesomeIcon icon={faArrowLeft} /></button>
          <h3 className="card-title">{view === "create" ? "Create New Staff" : "Update Staff Account"}</h3>
        </div>
        
        <form onSubmit={handleSave} className="auth-form">
          <div className="form-grid">
            <div>
              <label className="auth-label">Full Name</label>
              <div className="input-with-icon">
                <span className="input-icon"><FontAwesomeIcon icon={faUserTie} /></span>
                <input className="auth-input" required defaultValue={selectedStaff?.name} placeholder="e.g. John Doe" />
              </div>
            </div>
            
            <div>
              <label className="auth-label">Role</label>
              <div className="input-div">
                <select className="auth-input" defaultValue={selectedStaff?.role || "Teacher"}>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                  <option value="Clerk">Clerk</option>
                </select>
              </div>
            </div>
          </div>

          <label className="auth-label">Recovery Email</label>
          <div className="input-with-icon">
            <span className="input-icon"><FontAwesomeIcon icon={faEnvelope} /></span>
            <input type="email" className="auth-input" defaultValue={selectedStaff?.email} placeholder="email@example.com" />
          </div>

          <label className="auth-label">{view === "create" ? "Password" : "New Password (Optional)"}</label>
          <div className="input-with-icon">
            <span className="input-icon"><FontAwesomeIcon icon={faLock} /></span>
            <input type="password" className="auth-input" placeholder="••••••••" />
          </div>

          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setView("list")}>Cancel</button>
            <button type="submit" className="btn btn-primary">{view === "create" ? "Create Account" : "Update Account"}</button>
          </div>
        </form>
      </div>
    );
  }

  // --- Main List View ---
  return (
    <div>
      <div className="toolbar">
        <div className="input-with-icon search-bar">
          <span className="input-icon"><FontAwesomeIcon icon={faSearch} /></span>
          <input 
            className="auth-input" 
            placeholder="Search staff..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => { setSelectedStaff(null); setView("create"); }}>
          <FontAwesomeIcon icon={faPlus} /> Add Staff Member
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Staff Info</th>
              <th>Username (ID)</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map((staff) => (
              <tr key={staff.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar-placeholder">
                      <FontAwesomeIcon icon={faUserTie} />
                    </div>
                    <div className="user-details">
                      <span className="user-name">{staff.name}</span>
                      <span className="user-email">{staff.email}</span>
                    </div>
                  </div>
                </td>
                <td style={{ fontFamily: 'monospace' }}>{staff.username}</td>
                <td><span className="role-badge">{staff.role}</span></td>
                <td>
                  {staff.isActive ? (
                    <span className="status-active"><FontAwesomeIcon icon={faCheckCircle} /> Active</span>
                  ) : (
                    <span className="status-blocked"><FontAwesomeIcon icon={faBan} /> Blocked</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => { setSelectedStaff(staff); setView("edit"); }} className="btn action-btn" title="Edit">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => toggleStatus(staff.id)} className="btn action-btn btn-block" title={staff.isActive ? "Block" : "Unblock"}>
                      <FontAwesomeIcon icon={staff.isActive ? faBan : faCheckCircle} />
                    </button>
                    <button onClick={() => handleDelete(staff.id)} className="btn action-btn btn-delete" title="Delete">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
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
import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, faFilter, faEllipsisH, faEdit, faTrash, 
  faPowerOff, faCamera, faEye, faEyeSlash, faTimes, 
  faUserGraduate, faUsers, faPlus, faAddressBook, faLayerGroup, faCheck
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/owner.css";

// --- Interfaces ---
interface Student {
  id: number;
  name: string;
  email: string;
  recoveryEmail?: string;
  rollNo: string;
  grade: string;
  status: "Active" | "Inactive";
  avatar?: string;
}

interface Group {
  id: number;
  name: string;
  studentIds: number[];
}

export default function StudentManagement() {
  const [activeTab, setActiveTab] = useState<"students" | "groups">("students");

  // --- Mock Data ---
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "Ahmad Raza", email: "ahmad@student.com", recoveryEmail: "parent1@gmail.com", rollNo: "STD-001", grade: "10th Grade", status: "Active", avatar: "https://i.pravatar.cc/150?img=12" },
    { id: 2, name: "Sara Ahmed", email: "sara@student.com", rollNo: "STD-002", grade: "10th Grade", status: "Active", avatar: "https://i.pravatar.cc/150?img=5" },
    { id: 3, name: "Ali Khan", email: "ali@student.com", recoveryEmail: "alikhan_guardian@yahoo.com", rollNo: "STD-003", grade: "9th Grade", status: "Inactive", avatar: "https://i.pravatar.cc/150?img=14" }
  ]);

  const [groups, setGroups] = useState<Group[]>([
    { id: 1, name: "Science Batch A", studentIds: [1, 2] },
    { id: 2, name: "Arts Batch B", studentIds: [3] }
  ]);

  // --- UI State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // --- Modal States ---
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [studentForm, setStudentForm] = useState({
    id: 0, prefix: "STD-", postfix: "", name: "", email: "", recoveryEmail: "",
    grade: "", password: "", avatar: null as string | null
  });

  const [groupForm, setGroupForm] = useState<Group>({
    id: 0, name: "", studentIds: []
  });

  // --- Helpers ---
  useEffect(() => {
    const handleClickOutside = () => { setOpenMenuId(null); setIsFilterOpen(false); };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "All" || student.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Get group name for a student
  const getStudentGroup = (studentId: number) => {
    const group = groups.find(g => g.studentIds.includes(studentId));
    return group ? group.name : "Unassigned";
  };

  const toggleFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setIsFilterOpen(!isFilterOpen);
  };

  // --- Handlers: Students ---
  const handleOpenStudentModal = (student?: Student) => {
    if (student) {
      const parts = student.rollNo.split('-');
      const prefix = parts.length > 1 ? parts.slice(0, -1).join('-') + '-' : "STD-";
      const postfix = parts.length > 1 ? parts[parts.length - 1] : student.rollNo;

      setStudentForm({
        id: student.id, prefix, postfix, name: student.name, email: student.email,
        recoveryEmail: student.recoveryEmail || "", grade: student.grade,
        password: "", avatar: student.avatar || null
      });
    } else {
      setStudentForm({ id: 0, prefix: "STD-", postfix: "", name: "", email: "", recoveryEmail: "", grade: "", password: "", avatar: null });
    }
    setIsStudentModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const rollNo = studentForm.prefix + studentForm.postfix;

    if (studentForm.id !== 0) {
      setStudents(students.map(s => s.id === studentForm.id ? {
        ...s, name: studentForm.name, email: studentForm.email, recoveryEmail: studentForm.recoveryEmail,
        rollNo, grade: studentForm.grade, avatar: studentForm.avatar || s.avatar
      } : s));
    } else {
      setStudents([...students, {
        id: Date.now(), name: studentForm.name, email: studentForm.email, recoveryEmail: studentForm.recoveryEmail,
        rollNo, grade: studentForm.grade, status: "Active", avatar: studentForm.avatar || "https://i.pravatar.cc/150?img=12"
      }]);
    }
    setIsStudentModalOpen(false);
  };

  const handleDeleteStudent = (id: number) => {
    if (window.confirm("Remove this student?")) setStudents(students.filter(s => s.id !== id));
    setOpenMenuId(null);
  };

  const toggleStudentStatus = (id: number) => {
    setStudents(students.map(s => s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s));
    setOpenMenuId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStudentForm({ ...studentForm, avatar: URL.createObjectURL(e.target.files[0]) });
    }
  };

  // --- Handlers: Groups ---
  const handleOpenGroupModal = (group?: Group) => {
    if (group) {
      setGroupForm({ ...group });
    } else {
      setGroupForm({ id: 0, name: "", studentIds: [] });
    }
    setIsGroupModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupForm.id !== 0) {
      setGroups(groups.map(g => g.id === groupForm.id ? groupForm : g));
    } else {
      setGroups([...groups, { ...groupForm, id: Date.now() }]);
    }
    setIsGroupModalOpen(false);
  };

  const handleDeleteGroup = (id: number) => {
    if (window.confirm("Delete this group? Students will remain in the directory.")) {
      setGroups(groups.filter(g => g.id !== id));
    }
    setOpenMenuId(null);
  };

  const toggleGroupStudent = (studentId: number) => {
    setGroupForm(prev => ({
      ...prev, 
      studentIds: prev.studentIds.includes(studentId) 
        ? prev.studentIds.filter(id => id !== studentId) 
        : [...prev.studentIds, studentId]
    }));
  };

  return (
    <div className="admin-page-container">
      
      {/* --- Page Header & Action Buttons --- */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Student Management</h2>
          
          {/* Contextual Top-Right Action Button */}
          {activeTab === 'students' ? (
            <button className="btn btn-primary" style={{ backgroundColor: '#1e3a8a' }} onClick={() => handleOpenStudentModal()}>
              <FontAwesomeIcon icon={faPlus} /> Register Student
            </button>
          ) : (
            <button className="btn btn-primary" style={{ backgroundColor: '#1e3a8a' }} onClick={() => handleOpenGroupModal()}>
              <FontAwesomeIcon icon={faPlus} /> Create New Group
            </button>
          )}
        </div>
        
        {/* Professional Tabs */}
        <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
          <button 
            style={{ 
              padding: '0.75rem 0', border: 'none', background: 'none', 
              borderBottom: activeTab === 'students' ? '2px solid var(--color-primary-500)' : '2px solid transparent', 
              color: activeTab === 'students' ? 'var(--color-primary-500)' : '#6b7280', 
              fontWeight: '600', fontSize: '1rem', cursor: 'pointer', display: 'flex', gap: '0.5rem', 
              alignItems: 'center', marginBottom: '-2px', transition: 'all 0.2s' 
            }}
            onClick={() => setActiveTab("students")}
          >
            <FontAwesomeIcon icon={faAddressBook} /> Student Directory
          </button>
          <button 
            style={{ 
              padding: '0.75rem 0', border: 'none', background: 'none', 
              borderBottom: activeTab === 'groups' ? '2px solid var(--color-primary-500)' : '2px solid transparent', 
              color: activeTab === 'groups' ? 'var(--color-primary-500)' : '#6b7280', 
              fontWeight: '600', fontSize: '1rem', cursor: 'pointer', display: 'flex', gap: '0.5rem', 
              alignItems: 'center', marginBottom: '-2px', transition: 'all 0.2s' 
            }}
            onClick={() => setActiveTab("groups")}
          >
            <FontAwesomeIcon icon={faLayerGroup} /> Groups
          </button>
        </div>
      </div>

      {/* --- TAB: STUDENTS --- */}
      {activeTab === "students" && (
        <div className="card" style={{ padding: '1.5rem', minHeight: '400px', border: 'none' }}>
          
          {/* Search & Filter Bar (Right Aligned) */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1.5rem', position: 'relative' }}>
            
            <div className="input-with-icon" style={{ margin: 0, width: '300px' }}>
              <span className="input-icon"><FontAwesomeIcon icon={faSearch} /></span>
              <input className="auth-input" placeholder="Search by name or roll number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ height: '38px', fontSize: '0.9rem' }} />
            </div>

            {/* Filter Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                className="btn" 
                style={{ height: '38px', background: '#fff', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                onClick={toggleFilter}
              >
                {filterStatus === "All" ? "Filter" : filterStatus} <FontAwesomeIcon icon={faFilter} />
              </button>
              
              {isFilterOpen && (
                <div className="filter-dropdown">
                  {['All', 'Active', 'Inactive'].map((status) => (
                    <button 
                      key={status} 
                      className="dropdown-item" 
                      onClick={() => { setFilterStatus(status as any); setIsFilterOpen(false); }}
                      style={{ justifyContent: 'space-between', padding: '0.6rem 1rem' }}
                    >
                      {status}
                      {filterStatus === status && <FontAwesomeIcon icon={faCheck} style={{ color: '#10b981' }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="col-profile">Profile</th>
                  <th className="col-name">Student Info</th>
                  <th>Grade & Group</th>
                  <th>Contact Info</th>
                  <th className="col-status">Status</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(student => (
                    <tr key={student.id}>
                      <td className="col-profile">
                        <img src={student.avatar} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      </td>
                      <td className="col-name">
                          <div style={{ fontWeight: '600', color: '#111827' }}>{student.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>{student.rollNo}</div>
                      </td>
                      <td>
                          <div style={{ color: '#374151', fontSize: '0.9rem', fontWeight: '500' }}>{student.grade}</div>
                          <div style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 'bold' }}>{getStudentGroup(student.id)}</div>
                      </td>
                      <td>
                          <div style={{ color: '#4b5563', fontSize: '0.85rem' }}>{student.email}</div>
                          {student.recoveryEmail && <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Rec: {student.recoveryEmail}</div>}
                      </td>
                      <td className="col-status">
                        <span className={`status-pill ${student.status === 'Active' ? 'status-active' : 'status-inactive'}`}>{student.status}</span>
                      </td>
                      <td className="col-actions">
                        <div className="action-btn-wrapper">
                          <button className="btn action-btn" style={{ background: 'transparent', padding: '0.4rem', color: '#6b7280' }} onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === student.id ? null : student.id); }}>
                            <FontAwesomeIcon icon={faEllipsisH} />
                          </button>
                          {openMenuId === student.id && (
                            <div className="action-menu-dropdown">
                              <button className="dropdown-item" onClick={() => handleOpenStudentModal(student)}><FontAwesomeIcon icon={faEdit} fixedWidth /> Edit Details</button>
                              <button className="dropdown-item" onClick={() => toggleStudentStatus(student.id)}><FontAwesomeIcon icon={faPowerOff} fixedWidth /> {student.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                              <button className="dropdown-item danger" onClick={() => handleDeleteStudent(student.id)}><FontAwesomeIcon icon={faTrash} fixedWidth /> Remove</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                      <FontAwesomeIcon icon={faUserGraduate} size="2x" style={{ marginBottom: '1rem', color: '#d1d5db' }} />
                      <p>No students found in the directory.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', color: '#6b7280', fontSize: '0.85rem' }}>
             <span>Showing {filteredStudents.length} of {students.length} students</span>
             <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: '#fff', border: '1px solid #d1d5db', cursor: 'not-allowed', color: '#9ca3af' }} disabled>Previous</button>
                <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>1</button>
                <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: '#fff', border: '1px solid #d1d5db', cursor: 'not-allowed', color: '#9ca3af' }} disabled>Next</button>
             </div>
          </div>

        </div>
      )}

      {/* --- TAB: GROUPS --- */}
      {activeTab === "groups" && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {groups.map(group => (
               <div key={group.id} className="card" style={{ 
                 padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', 
                 borderTop: '4px solid var(--color-primary-500)', transition: 'transform 0.2s, box-shadow 0.2s' 
               }}>
                 {/* Group Header */}
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div>
                     <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>{group.name}</h3>
                     <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>
                       <FontAwesomeIcon icon={faUsers} style={{ marginRight: '0.25rem' }}/> {group.studentIds.length} Students Enrolled
                     </p>
                   </div>
                   <div className="action-btn-wrapper">
                      <button className="btn action-btn" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === group.id ? null : group.id); }}>
                        <FontAwesomeIcon icon={faEllipsisH} />
                      </button>
                      {openMenuId === group.id && (
                        <div className="action-menu-dropdown">
                          <button className="dropdown-item" onClick={() => handleOpenGroupModal(group)}><FontAwesomeIcon icon={faEdit} fixedWidth /> Edit Group</button>
                          <button className="dropdown-item danger" onClick={() => handleDeleteGroup(group.id)}><FontAwesomeIcon icon={faTrash} fixedWidth /> Delete Group</button>
                        </div>
                      )}
                   </div>
                 </div>

                 {/* Spacer to push button down if needed */}
                 <div style={{ flexGrow: 1 }}></div>

                 {/* Manage Button */}
                 <button 
                   className="btn" 
                   style={{ 
                     width: '100%', 
                     background: '#e0e7ff',
                     color: '#4338ca',     
                     border: 'none', 
                     fontWeight: '600',
                     justifyContent: 'center',
                     padding: '0.6rem 1rem',
                     borderRadius: '6px',
                     transition: 'all 0.2s ease'
                   }} 
                   onMouseEnter={(e) => e.currentTarget.style.background = '#c7d2fe'}
                   onMouseLeave={(e) => e.currentTarget.style.background = '#e0e7ff'}
                   onClick={() => handleOpenGroupModal(group)}
                 >
                   Manage Group
                 </button>
               </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL: STUDENT REGISTRATION --- */}
      {isStudentModalOpen && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ width: '650px' }}>
            <div className="owner-modal-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>{studentForm.id === 0 ? "Register Student" : "Edit Student Details"}</h3>
              <button onClick={() => setIsStudentModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} size="lg" color="#6b7280" /></button>
            </div>
            <form onSubmit={handleSaveStudent}>
              <div className="owner-modal-body modal-form-grid">
                
                {/* Photo Upload */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src={studentForm.avatar || "https://i.pravatar.cc/150?img=12"} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #e5e7eb' }} />
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                  <button type="button" className="btn btn-upload" onClick={() => fileInputRef.current?.click()} style={{ marginTop: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#f3f4f6', color: '#374151' }}>
                    <FontAwesomeIcon icon={faCamera} /> Upload Picture
                  </button>
                </div>

                <div className="password-row">
                  <div>
                    <label className="auth-label">Full Name</label>
                    <input className="auth-input" required value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <label className="auth-label">Roll Number</label>
                    <div className="input-group-split">
                      <div className="input-group-prefix">{studentForm.prefix}</div>
                      <input className="input-group-field" required value={studentForm.postfix} onChange={e => setStudentForm({...studentForm, postfix: e.target.value})} placeholder="001" />
                    </div>
                  </div>
                </div>

                <div className="password-row">
                  <div>
                    <label className="auth-label">Primary Email</label>
                    <input type="email" className="auth-input" required value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} placeholder="student@school.com" />
                  </div>
                  <div>
                    <label className="auth-label">Recovery Email (Optional)</label>
                    <input type="email" className="auth-input" value={studentForm.recoveryEmail} onChange={e => setStudentForm({...studentForm, recoveryEmail: e.target.value})} placeholder="parent@gmail.com" />
                  </div>
                </div>

                <div className="password-row">
                  <div>
                    <label className="auth-label">Grade / Class Level</label>
                    <input className="auth-input" required value={studentForm.grade} onChange={e => setStudentForm({...studentForm, grade: e.target.value})} placeholder="e.g. 10th Grade" />
                  </div>
                  <div>
                    <label className="auth-label">Temporary Password {studentForm.id !== 0 && "(Optional)"}</label>
                    <div className="input-with-icon has-right" style={{ margin: 0 }}>
                      <input type={showPassword ? "text" : "password"} className="auth-input" required={studentForm.id === 0} value={studentForm.password} onChange={e => setStudentForm({...studentForm, password: e.target.value})} placeholder="••••••••" style={{ paddingLeft: '1rem' }} />
                      <button type="button" className="input-right-icon" onClick={() => setShowPassword(!showPassword)}>
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
              <div className="owner-modal-footer">
                <button type="button" className="btn" onClick={() => setIsStudentModalOpen(false)} style={{ background: 'white', border: '1px solid #d1d5db' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#1e3a8a' }}>{studentForm.id === 0 ? "Register Student" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: GROUP MANAGEMENT --- */}
      {isGroupModalOpen && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ width: '550px' }}>
            <div className="owner-modal-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>{groupForm.id === 0 ? "Create Student Group" : "Manage Group"}</h3>
              <button onClick={() => setIsGroupModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} size="lg" color="#6b7280" /></button>
            </div>
            
            <form onSubmit={handleSaveGroup}>
              <div className="owner-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f9fafb' }}>
                
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <label className="auth-label">Group Name</label>
                  <input className="auth-input" required value={groupForm.name} onChange={e => setGroupForm({...groupForm, name: e.target.value})} placeholder="e.g. Science Batch A" />
                </div>

                {/* Add/Remove Students from Group */}
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <label className="auth-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                      Select Students for Group ({groupForm.studentIds.length} Selected)
                    </label>
                    <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                      {students.map(student => (
                        <label key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', margin: 0, transition: 'background 0.2s' }} className="hover:bg-gray-50">
                          <input type="checkbox" checked={groupForm.studentIds.includes(student.id)} onChange={() => toggleGroupStudent(student.id)} />
                          <img src={student.avatar} alt="Pfp" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#111827' }}>{student.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>{student.rollNo}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                </div>

              </div>
              <div className="owner-modal-footer">
                <button type="button" className="btn" onClick={() => setIsGroupModalOpen(false)} style={{ background: 'white', border: '1px solid #d1d5db' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#1e3a8a' }}>{groupForm.id === 0 ? "Create Group" : "Save Group"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
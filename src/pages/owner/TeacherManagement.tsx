// src/pages/owner/TeacherManagement.tsx
import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, faFilter, faEllipsisH, faEdit, faTrash, 
  faPowerOff, faCamera, faEye, faEyeSlash, faTimes, faCheck, faBookOpen
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/owner.css";

// Extended Interface for Real-World Usage
interface Teacher {
  id: number;
  name: string;
  email: string;
  empId: string;
  subject: string;
  phone: string;
  status: "Active" | "Inactive";
  avatar?: string;
}

export default function TeacherManagement() {
  // Mock Data
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: 1, name: "Mr. Smith", email: "smith@school.com", empId: "TCH-001", subject: "Mathematics", phone: "+92 300 1234567", status: "Active", avatar: "https://i.pravatar.cc/150?img=11" },
    { id: 2, name: "Ms. Johnson", email: "johnson@school.com", empId: "TCH-002", subject: "Physics", phone: "+92 301 7654321", status: "Active", avatar: "https://i.pravatar.cc/150?img=5" },
    { id: 3, name: "Dr. Ali", email: "ali@school.com", empId: "TCH-003", subject: "Chemistry", phone: "+92 333 9876543", status: "Inactive", avatar: "https://i.pravatar.cc/150?img=8" },
  ]);

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    id: 0,
    prefix: "TCH-",
    postfix: "",
    name: "",
    email: "",
    subject: "",
    phone: "",
    password: "",
    avatar: null as string | null
  });

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      setIsFilterOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // --- Helpers ---
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          teacher.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "All" || teacher.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // --- Handlers ---
  const toggleMenu = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFilterOpen(false);
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const toggleFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setIsFilterOpen(!isFilterOpen);
  };

  const handleOpenModal = (teacher?: Teacher) => {
    if (teacher) {
      // Edit Mode
      const parts = teacher.empId.split('-');
      const prefix = parts.length > 1 ? parts[0] + '-' : "TCH-";
      const postfix = parts.length > 1 ? parts.slice(1).join('-') : teacher.empId;

      setFormData({
        id: teacher.id,
        prefix,
        postfix,
        name: teacher.name,
        email: teacher.email,
        subject: teacher.subject,
        phone: teacher.phone,
        password: "", // Don't populate password on edit for security
        avatar: teacher.avatar || null
      });
    } else {
      // Create Mode
      setFormData({ id: 0, prefix: "TCH-", postfix: "", name: "", email: "", subject: "", phone: "", password: "", avatar: null });
    }
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, avatar: URL.createObjectURL(e.target.files[0]) });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.id !== 0) {
      // Update
      setTeachers(teachers.map(t => t.id === formData.id ? {
        ...t,
        name: formData.name,
        email: formData.email,
        empId: formData.prefix + formData.postfix,
        subject: formData.subject,
        phone: formData.phone,
        avatar: formData.avatar || t.avatar
      } : t));
      alert("Teacher Updated Successfully!");
    } else {
      // Create
      const newTeacher: Teacher = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        empId: formData.prefix + formData.postfix,
        subject: formData.subject,
        phone: formData.phone,
        status: "Active",
        avatar: formData.avatar || "https://i.pravatar.cc/150?img=33" // Default fallback
      };
      setTeachers([...teachers, newTeacher]);
      alert("Teacher Added Successfully!");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to remove this teacher? This action cannot be undone.")) {
      setTeachers(teachers.filter(t => t.id !== id));
    }
    setOpenMenuId(null);
  };

  const toggleStatus = (id: number) => {
    setTeachers(teachers.map(t => t.id === id ? { ...t, status: t.status === "Active" ? "Inactive" : "Active" } : t));
    setOpenMenuId(null);
  };

  return (
    <div className="admin-page-container">
      {/* --- Header --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Teaching Staff</h2>
        <button className="btn btn-primary" style={{ backgroundColor: '#1e3a8a' }} onClick={() => handleOpenModal()}>
          Add New Teacher
        </button>
      </div>

      {/* --- Main Card --- */}
      <div className="card" style={{ padding: '1.5rem', minHeight: '400px', width: '100%' }}>
        <h3 className="card-title" style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Directory</h3>
        
        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1rem', position: 'relative' }}>
          
          <div className="input-with-icon" style={{ margin: 0, width: '250px' }}>
            <span className="input-icon"><FontAwesomeIcon icon={faSearch} /></span>
            <input 
              className="auth-input" 
              placeholder="Search by name, email or subject" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: '38px', fontSize: '0.9rem' }}
            />
          </div>
          
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

        {/* --- Table --- */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="col-profile">Profile</th>
                <th className="col-name">Name</th>
                <th className="col-email">Contact Info</th>
                <th>Subject</th>
                <th className="col-status">Status</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map(teacher => (
                  <tr key={teacher.id}>
                    <td className="col-profile">
                      <img 
                        src={teacher.avatar} 
                        alt="Profile" 
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                    </td>
                    <td className="col-name">
                        <div style={{ fontWeight: '500', color: '#111827' }}>{teacher.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{teacher.empId}</div>
                    </td>
                    <td className="col-email">
                        <div style={{ color: '#4b5563', fontSize: '0.9rem' }}>{teacher.email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{teacher.phone}</div>
                    </td>
                    <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.6rem', background: '#f3f4f6', borderRadius: '6px', fontSize: '0.85rem', color: '#374151' }}>
                            <FontAwesomeIcon icon={faBookOpen} style={{ color: '#8b5cf6' }} /> {teacher.subject}
                        </span>
                    </td>
                    <td className="col-status">
                      <span className={`status-pill ${teacher.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                        {teacher.status}
                      </span>
                    </td>
                    <td className="col-actions">
                      <div className="action-btn-wrapper">
                        <button 
                          className="btn action-btn" 
                          style={{ background: 'transparent', padding: '0.4rem', color: '#6b7280' }}
                          onClick={(e) => toggleMenu(teacher.id, e)}
                        >
                          <FontAwesomeIcon icon={faEllipsisH} />
                        </button>
                        
                        {openMenuId === teacher.id && (
                          <div className="action-menu-dropdown">
                            <button className="dropdown-item" onClick={() => handleOpenModal(teacher)}>
                              <FontAwesomeIcon icon={faEdit} style={{ color: '#6b7280', width: '16px' }} /> Edit Details
                            </button>
                            <button className="dropdown-item" onClick={() => toggleStatus(teacher.id)}>
                              <FontAwesomeIcon icon={faPowerOff} style={{ color: '#6b7280', width: '16px' }} /> 
                              {teacher.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button className="dropdown-item danger" onClick={() => handleDelete(teacher.id)}>
                              <FontAwesomeIcon icon={faTrash} style={{ width: '16px' }} /> Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                    <FontAwesomeIcon icon={faSearch} size="2x" style={{ marginBottom: '1rem', color: '#d1d5db' }} />
                    <p>No teachers found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', color: '#6b7280', fontSize: '0.85rem' }}>
           <span>Showing {filteredTeachers.length} of {teachers.length} teachers</span>
           <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', background: '#fff', border: '1px solid #d1d5db' }} disabled>Previous</button>
              <button className="btn btn-primary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#1e3a8a' }}>1</button>
              <button className="btn" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', background: '#fff', border: '1px solid #d1d5db' }} disabled>Next</button>
           </div>
        </div>
      </div>

      {/* --- Modal: Add/Edit Teacher --- */}
      {isModalOpen && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ width: '600px' }}>
            <div className="owner-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.25rem' }}>
                {formData.id === 0 ? "Onboard New Teacher" : "Edit Teacher Profile"}
              </h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#6b7280' }}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="owner-modal-body modal-form-grid">
                
                {/* Profile Picture */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                  <img 
                    src={formData.avatar || "https://i.pravatar.cc/150?img=33"} 
                    alt="Preview" 
                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #e5e7eb', marginBottom: '0.5rem' }}
                  />
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                  <button type="button" className="btn btn-upload" onClick={handleUploadClick} style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    <FontAwesomeIcon icon={faCamera} /> Change Photo
                  </button>
                </div>

                <div className="password-row" style={{ gap: '1.5rem' }}>
                    {/* Full Name */}
                    <div>
                    <label className="auth-label">Full Name</label>
                    <input 
                        className="auth-input" 
                        placeholder="e.g. Sarah Jenkins"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        required 
                    />
                    </div>

                    {/* Employee ID */}
                    <div>
                    <label className="auth-label">Employee ID</label>
                    <div className="input-group-split">
                        <div className="input-group-prefix">{formData.prefix}</div>
                        <input 
                        className="input-group-field" 
                        placeholder="001" 
                        value={formData.postfix}
                        onChange={e => setFormData({...formData, postfix: e.target.value})}
                        required
                        />
                    </div>
                    </div>
                </div>

                <div className="password-row" style={{ gap: '1.5rem' }}>
                    {/* Email */}
                    <div>
                    <label className="auth-label">Email Address</label>
                    <input 
                        type="email"
                        className="auth-input" 
                        placeholder="teacher@school.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        required 
                    />
                    </div>

                    {/* Phone */}
                    <div>
                    <label className="auth-label">Phone Number</label>
                    <input 
                        type="tel"
                        className="auth-input" 
                        placeholder="+1 234 567 8900"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        required 
                    />
                    </div>
                </div>

                {/* Subject Specialization */}
                <div>
                  <label className="auth-label">Primary Subject Specialization</label>
                  <input 
                    className="auth-input" 
                    placeholder="e.g. Advanced Physics, Mathematics"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    required 
                  />
                </div>

                {/* Password (Only show on creation or if they want to reset) */}
                <div>
                  <label className="auth-label">Temporary Password {formData.id !== 0 && "(Leave blank to keep current)"}</label>
                  <div className="input-with-icon has-right" style={{ margin: 0 }}>
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="auth-input"
                      placeholder="Generate temporary password"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      required={formData.id === 0}
                      style={{ paddingLeft: '1rem' }}
                    />
                    <button type="button" className="input-right-icon" onClick={() => setShowPassword(!showPassword)}>
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

              </div>

              <div className="owner-modal-footer">
                <button type="button" className="btn" onClick={handleCloseModal} style={{ background: 'white', border: '1px solid #d1d5db' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#1e3a8a' }}>
                  {formData.id === 0 ? "Complete Onboarding" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
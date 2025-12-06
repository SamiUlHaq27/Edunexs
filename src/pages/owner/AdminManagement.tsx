import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, faSearch, faFilter, faEllipsisH, 
  faEdit, faTrash, faPowerOff, faCamera, 
  faEye, faEyeSlash, faTimes, faCheck 
} from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../../config/assets";
import "../../styles/owner.css";

interface Admin {
  id: number;
  name: string;
  email: string;
  empId: string;
  status: "Active" | "Inactive";
  avatar?: string;
}

export default function AdminManagement() {
  // Mock Data
  const [admins, setAdmins] = useState<Admin[]>([
    { id: 1, name: "Saad", email: "saad@gmail.com", empId: "EDUNEXS-001", status: "Active", avatar: "https://i.pravatar.cc/150?img=11" },
    { id: 2, name: "Ayesha", email: "ayesha@gmail.com", empId: "EDUNEXS-002", status: "Active", avatar: "https://i.pravatar.cc/150?img=5" },
    { id: 3, name: "Ali Khan", email: "alikhan@gmail.com", empId: "EDUNEXS-003", status: "Inactive", avatar: "https://i.pravatar.cc/150?img=3" },
  ]);

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    id: 0,
    prefix: "EDUNEXS-",
    postfix: "",
    name: "",
    email: "",
    password: "",
    confirm: "",
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
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          admin.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "All" || admin.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // --- Handlers ---

  const toggleMenu = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // Close filter if open
    setIsFilterOpen(false);
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const toggleFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Close row menu if open
    setOpenMenuId(null);
    setIsFilterOpen(!isFilterOpen);
  };

  const handleOpenModal = (admin?: Admin) => {
    if (admin) {
      // Edit Mode
      const parts = admin.empId.split('-');
      const prefix = parts.length > 1 ? parts[0] + '-' : "EDUNEXS-";
      const postfix = parts.length > 1 ? parts.slice(1).join('-') : admin.empId;

      setFormData({
        id: admin.id,
        prefix,
        postfix,
        name: admin.name,
        email: admin.email,
        password: "",
        confirm: "",
        avatar: admin.avatar || null
      });
    } else {
      // Create Mode
      setFormData({ id: 0, prefix: "EDUNEXS-", postfix: "", name: "", email: "", password: "", confirm: "", avatar: null });
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
    if (formData.password && formData.password !== formData.confirm) {
      alert("Passwords do not match!");
      return;
    }

    if (formData.id !== 0) {
      // Update
      setAdmins(admins.map(a => a.id === formData.id ? {
        ...a,
        name: formData.name,
        email: formData.email,
        empId: formData.prefix + formData.postfix,
        avatar: formData.avatar || a.avatar
      } : a));
      alert("Administrator Updated Successfully!");
    } else {
      // Create
      const newAdmin: Admin = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        empId: formData.prefix + formData.postfix,
        status: "Active",
        avatar: formData.avatar || "https://i.pravatar.cc/150?img=12"
      };
      setAdmins([...admins, newAdmin]);
      alert("Administrator Added Successfully!");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      setAdmins(admins.filter(a => a.id !== id));
    }
    setOpenMenuId(null);
  };

  const toggleStatus = (id: number) => {
    setAdmins(admins.map(a => a.id === id ? { ...a, status: a.status === "Active" ? "Inactive" : "Active" } : a));
    setOpenMenuId(null);
  };

  return (
    <div className="admin-page-container">
      {/* --- Header --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Institution Administrators</h2>
        <button className="btn btn-primary" style={{ backgroundColor: '#1e3a8a' }} onClick={() => handleOpenModal()}>
          Add New Admin
        </button>
      </div>

      {/* --- Main Card --- */}
      <div className="card" style={{ padding: '1.5rem', minHeight: '400px', width: '100%' }}>
        <h3 className="card-title" style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Registered Administrators</h3>
        
        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1rem', position: 'relative' }}>
          
          {/* Search */}
          <div className="input-with-icon" style={{ margin: 0, width: '250px' }}>
            <span className="input-icon"><FontAwesomeIcon icon={faSearch} /></span>
            <input 
              className="auth-input" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: '38px', fontSize: '0.9rem' }}
            />
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

        {/* --- Table --- */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="col-profile">Profile</th>
                <th className="col-name">Name</th>
                <th className="col-email">Email</th>
                <th className="col-status">Status</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.length > 0 ? (
                filteredAdmins.map(admin => (
                  <tr key={admin.id}>
                    <td className="col-profile">
                      <img 
                        src={admin.avatar} 
                        alt="Profile" 
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                    </td>
                    <td className="col-name">
                        <div style={{ fontWeight: '500' }}>{admin.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{admin.empId}</div>
                    </td>
                    <td className="col-email" style={{ color: '#6b7280' }}>{admin.email}</td>
                    <td className="col-status">
                      <span className={`status-pill ${admin.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                        {admin.status}
                      </span>
                    </td>
                    <td className="col-actions">
                      <div className="action-btn-wrapper">
                        <button 
                          className="btn action-btn" 
                          style={{ background: 'transparent', padding: '0.4rem', color: '#6b7280' }}
                          onClick={(e) => toggleMenu(admin.id, e)}
                        >
                          <FontAwesomeIcon icon={faEllipsisH} />
                        </button>
                        
                        {/* Action Dropdown */}
                        {openMenuId === admin.id && (
                          <div className="action-menu-dropdown">
                            <button className="dropdown-item" onClick={() => handleOpenModal(admin)}>
                              <FontAwesomeIcon icon={faEdit} style={{ color: '#6b7280', width: '16px' }} /> Edit
                            </button>
                            <button className="dropdown-item" onClick={() => toggleStatus(admin.id)}>
                              <FontAwesomeIcon icon={faPowerOff} style={{ color: '#6b7280', width: '16px' }} /> 
                              {admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button className="dropdown-item danger" onClick={() => handleDelete(admin.id)}>
                              <FontAwesomeIcon icon={faTrash} style={{ width: '16px' }} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No administrators found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', color: '#6b7280', fontSize: '0.85rem' }}>
           <span>Showing 1-{filteredAdmins.length} of {admins.length} entries</span>
           <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', background: '#fff', border: '1px solid #d1d5db' }}>Previous</button>
              <button className="btn btn-primary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#1e3a8a' }}>1</button>
              <button className="btn" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', background: '#fff', border: '1px solid #d1d5db' }}>Next</button>
           </div>
        </div>
      </div>

      {/* --- Modal: Add/Edit Admin --- */}
      {isModalOpen && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ width: '550px' }}>
            <div className="owner-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.25rem' }}>
                {formData.id === 0 ? "Add New Administrator" : "Edit Administrator"}
              </h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#6b7280' }}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="owner-modal-body modal-form-grid">
                
                {/* Employee ID */}
                <div>
                  <label className="auth-label">Employee ID</label>
                  <div className="input-group-split">
                    <div className="input-group-prefix">{formData.prefix}</div>
                    <input 
                      className="input-group-field" 
                      placeholder="Enter postfix" 
                      value={formData.postfix}
                      onChange={e => setFormData({...formData, postfix: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="auth-label">Full Name</label>
                  <input 
                    className="auth-input" 
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>

                {/* Profile Picture */}
                <div>
                  <label className="auth-label">Profile Picture</label>
                  <div className="profile-upload-row">
                    <img 
                      src={formData.avatar || "https://i.pravatar.cc/150?img=12"} 
                      alt="Preview" 
                      className="profile-upload-preview" 
                    />
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <button type="button" className="btn btn-upload" onClick={handleUploadClick} style={{ backgroundColor: '#1f2937' }}>
                      <FontAwesomeIcon icon={faCamera} /> Upload Photo
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="auth-label">Email</label>
                  <input 
                    type="email"
                    className="auth-input" 
                    placeholder="Email@gmail.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>

                {/* Password Row */}
                <div className="password-row">
                  <div>
                    <label className="auth-label">Password {formData.id !== 0 && "(Optional)"}</label>
                    <div className="input-with-icon has-right" style={{ margin: 0 }}>
                      <input 
                        type={showPassword ? "text" : "password"}
                        className="auth-input"
                        placeholder="Password"
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
                  <div>
                    <label className="auth-label">Confirm Password</label>
                    <div className="input-with-icon has-right" style={{ margin: 0 }}>
                      <input 
                        type={showConfirm ? "text" : "password"}
                        className="auth-input"
                        placeholder="Password"
                        value={formData.confirm}
                        onChange={e => setFormData({...formData, confirm: e.target.value})}
                        required={formData.id === 0}
                        style={{ paddingLeft: '1rem' }}
                      />
                      <button type="button" className="input-right-icon" onClick={() => setShowConfirm(!showConfirm)}>
                        <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              <div className="owner-modal-footer">
                <button type="button" className="btn" onClick={handleCloseModal} style={{ background: 'white', border: '1px solid #d1d5db' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#1e3a8a' }}>
                  {formData.id === 0 ? "Add Admin" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
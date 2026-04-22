import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, faFilter, faEllipsisH, faEdit, faTrash, 
  faPlus, faCheck, faTimes, faBook, faGraduationCap, 
  faClock, faArchive, faLaptopCode, faCalculator, 
  faAtom, faFlask, faDna, faBookOpen
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/owner.css";

// --- Interfaces ---
interface Course {
  id: number;
  code: string;
  name: string;
  department: string;
  credits: number;
  status: "Active" | "Draft" | "Archived";
  description: string;
}

export default function CourseManagement() {
  // --- Mock Data ---
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, code: "CS-101", name: "Introduction to Computer Science", department: "Computer Science", credits: 4, status: "Active", description: "Fundamentals of programming, algorithms, and data structures. Perfect for beginners entering the tech field." },
    { id: 2, code: "MTH-205", name: "Calculus and Analytical Geometry", department: "Mathematics", credits: 3, status: "Active", description: "Limits, derivatives, integrals, and their real-world applications in physics and engineering." },
    { id: 3, code: "ENG-102", name: "Functional English", department: "Humanities", credits: 2, status: "Draft", description: "Enhancing reading, writing, and comprehension skills for professional and corporate environments." },
    { id: 4, code: "PHY-301", name: "Quantum Mechanics", department: "Physics", credits: 4, status: "Archived", description: "Introduction to quantum mechanics, wave functions, and uncertainty principles at an advanced level." },
  ]);

  const mockDepartments = ["Computer Science", "Mathematics", "Humanities", "Physics", "Chemistry", "Biology"];

  // --- UI State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Draft" | "Archived">("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState<Course>({
    id: 0, code: "", name: "", department: "", credits: 3, status: "Draft", description: ""
  });

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      setIsFilterOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // --- Helpers ---
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "All" || course.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const toggleFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setIsFilterOpen(!isFilterOpen);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Active": return { bg: '#d1fae5', text: '#065f46' }; 
      case "Draft": return { bg: '#fef3c7', text: '#92400e' }; 
      case "Archived": return { bg: '#f3f4f6', text: '#374151' }; 
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  // Dynamic colors and icons for departments
  const getDeptTheme = (dept: string) => {
    switch(dept) {
      case "Computer Science": return { icon: faLaptopCode, color: '#2563eb', bg: '#dbeafe' }; // Blue
      case "Mathematics": return { icon: faCalculator, color: '#e11d48', bg: '#ffe4e6' }; // Rose
      case "Humanities": return { icon: faBook, color: '#d97706', bg: '#fef3c7' }; // Amber
      case "Physics": return { icon: faAtom, color: '#9333ea', bg: '#f3e8ff' }; // Purple
      case "Chemistry": return { icon: faFlask, color: '#0d9488', bg: '#ccfbf1' }; // Teal
      case "Biology": return { icon: faDna, color: '#16a34a', bg: '#dcfce7' }; // Green
      default: return { icon: faGraduationCap, color: '#4b5563', bg: '#f3f4f6' }; // Gray
    }
  };

  // --- Handlers ---
  const handleOpenModal = (course?: Course) => {
    if (course) {
      setCourseForm({ ...course });
    } else {
      setCourseForm({ id: 0, code: "", name: "", department: "", credits: 3, status: "Active", description: "" });
    }
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (courseForm.id !== 0) {
      setCourses(courses.map(c => c.id === courseForm.id ? courseForm : c));
    } else {
      setCourses([...courses, { ...courseForm, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteCourse = (id: number) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      setCourses(courses.filter(c => c.id !== id));
    }
    setOpenMenuId(null);
  };

  const toggleCourseStatus = (id: number, currentStatus: string) => {
    let newStatus: "Active" | "Draft" | "Archived" = "Active";
    if (currentStatus === "Active") newStatus = "Archived";
    else if (currentStatus === "Archived") newStatus = "Draft";
    
    setCourses(courses.map(c => c.id === id ? { ...c, status: newStatus } : c));
    setOpenMenuId(null);
  };

  return (
    <div className="admin-page-container">
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Course Curriculum</h2>
        <button className="btn btn-primary" style={{ backgroundColor: '#1e3a8a' }} onClick={() => handleOpenModal()}>
          <FontAwesomeIcon icon={faPlus} /> Create New Course
        </button>
      </div>

      {/* Toolbar: Search & Filter */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1.5rem', position: 'relative' }}>
        <div className="input-with-icon" style={{ margin: 0, width: '300px' }}>
          <span className="input-icon"><FontAwesomeIcon icon={faSearch} /></span>
          <input 
            className="auth-input" 
            placeholder="Search courses..." 
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
              {['All', 'Active', 'Draft', 'Archived'].map((status) => (
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

      {/* Course Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {filteredCourses.length > 0 ? filteredCourses.map(course => {
          const deptTheme = getDeptTheme(course.department);
          return (
            <div key={course.id} className="card" style={{ 
              padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', 
              borderTop: '4px solid var(--color-primary-500)', transition: 'transform 0.2s, box-shadow 0.2s' 
            }}>
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>{course.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500', fontFamily: 'monospace' }}>
                      {course.code}
                    </span>
                    <span style={{ 
                      backgroundColor: getStatusColor(course.status).bg, 
                      color: getStatusColor(course.status).text, 
                      padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600' 
                    }}>
                      {course.status}
                    </span>
                  </div>
                </div>
                <div className="action-btn-wrapper">
                  <button className="btn action-btn" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === course.id ? null : course.id); }}>
                    <FontAwesomeIcon icon={faEllipsisH} />
                  </button>
                  {openMenuId === course.id && (
                    <div className="action-menu-dropdown">
                      <button className="dropdown-item" onClick={() => handleOpenModal(course)}><FontAwesomeIcon icon={faEdit} fixedWidth /> Edit Course</button>
                      <button className="dropdown-item" onClick={() => toggleCourseStatus(course.id, course.status)}>
                        <FontAwesomeIcon icon={course.status === 'Active' ? faArchive : faCheck} fixedWidth /> 
                        {course.status === 'Active' ? 'Archive Course' : 'Activate Course'}
                      </button>
                      <button className="dropdown-item danger" onClick={() => handleDeleteCourse(course.id)}><FontAwesomeIcon icon={faTrash} fixedWidth /> Delete Course</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Colorful Resource Badges Area */}
              <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #f3f4f6', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {/* Department Accent Block */}
                  <div style={{ flex: 1, background: 'white', padding: '0.75rem', borderRadius: '6px', border: `1px solid ${deptTheme.bg}`, borderLeft: `3px solid ${deptTheme.color}` }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: deptTheme.color, textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <FontAwesomeIcon icon={deptTheme.icon} /> Department
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#111827', fontWeight: '600' }}>{course.department}</div>
                  </div>

                  {/* Credits Accent Block */}
                  <div style={{ flex: 1, background: 'white', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1fae5', borderLeft: '3px solid #10b981' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#059669', textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <FontAwesomeIcon icon={faClock} /> Credits
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#111827', fontWeight: '600' }}>{course.credits} Hours</div>
                  </div>
                </div>

                {/* Description Accent Block */}
                <div style={{ background: 'white', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e0e7ff', borderLeft: '3px solid #4f46e5' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#4338ca', textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FontAwesomeIcon icon={faBookOpen} /> Description
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.5' }}>
                    {course.description || "No description provided."}
                  </div>
                </div>

              </div>

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
                onClick={() => handleOpenModal(course)}
              >
                Manage Course Options
              </button>
            </div>
          );
        }) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#6b7280', background: 'white', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
            <FontAwesomeIcon icon={faBook} size="3x" style={{ color: '#e5e7eb', marginBottom: '1rem' }} />
            <p>No courses found. Adjust your filters or click "Create New Course" to get started.</p>
          </div>
        )}
      </div>

      {/* --- MODAL: COURSE MANAGEMENT --- */}
      {isModalOpen && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ width: '750px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="owner-modal-header" style={{ display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
              <h3 style={{ margin: 0 }}>{courseForm.id === 0 ? "Create New Course" : "Manage Course"}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} size="lg" color="#6b7280" /></button>
            </div>
            
            <form onSubmit={handleSaveCourse} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="owner-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f9fafb', overflowY: 'auto', padding: '1.5rem' }}>
                
                {/* Course Name */}
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <label className="auth-label">Course Name</label>
                  <input className="auth-input" required value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} placeholder="e.g. Introduction to Computer Science" />
                </div>

                {/* Grid: Code, Department, Credits, Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <label className="auth-label">Course Code</label>
                    <input className="auth-input" required value={courseForm.code} onChange={e => setCourseForm({...courseForm, code: e.target.value})} placeholder="e.g. CS-101" style={{ fontFamily: 'monospace' }} />
                  </div>

                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <label className="auth-label">Department</label>
                    <select className="auth-input" value={courseForm.department} onChange={e => setCourseForm({...courseForm, department: e.target.value})} required style={{ padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', width: '100%', background: 'white' }}>
                      <option value="" disabled>Select Department...</option>
                      {mockDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                  </div>

                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <label className="auth-label">Credits / Hours</label>
                    <input type="number" min="1" max="10" className="auth-input" required value={courseForm.credits} onChange={e => setCourseForm({...courseForm, credits: parseInt(e.target.value) || 0})} placeholder="e.g. 3" />
                  </div>

                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <label className="auth-label">Status</label>
                    <select className="auth-input" value={courseForm.status} onChange={e => setCourseForm({...courseForm, status: e.target.value as any})} style={{ padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', width: '100%', background: 'white' }}>
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <label className="auth-label">Course Description</label>
                  <textarea 
                    className="auth-input" 
                    rows={3} 
                    value={courseForm.description} 
                    onChange={e => setCourseForm({...courseForm, description: e.target.value})} 
                    placeholder="Provide a brief overview of the syllabus..."
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>

              </div>
              <div className="owner-modal-footer" style={{ flexShrink: 0 }}>
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)} style={{ background: 'white', border: '1px solid #d1d5db' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#1e3a8a' }}>{courseForm.id === 0 ? "Create Course" : "Save Course"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

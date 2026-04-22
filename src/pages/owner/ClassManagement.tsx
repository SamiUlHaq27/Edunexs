import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEllipsisH, faEdit, faTrash, faTimes, 
  faUsers, faPlus, faChalkboardTeacher, faBook, faLayerGroup
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/owner.css";

// --- Interfaces ---
interface Student {
  id: number;
  name: string;
  rollNo: string;
  avatar: string;
}

interface StudentGroup {
  id: number;
  name: string;
  studentCount: number;
}

interface ClassModel {
  id: number;
  name: string;
  teachers: string[];
  courses: string[];
  studentIds: number[];
  groupIds: number[];
}

export default function ClassManagement() {
  // --- Mock Data Dependencies ---
  const [students] = useState<Student[]>([
    { id: 1, name: "Ahmad Raza", rollNo: "STD-001", avatar: "https://i.pravatar.cc/150?img=12" },
    { id: 2, name: "Sara Ahmed", rollNo: "STD-002", avatar: "https://i.pravatar.cc/150?img=5" },
    { id: 3, name: "Ali Khan", rollNo: "STD-003", avatar: "https://i.pravatar.cc/150?img=14" },
    { id: 4, name: "Zainab Bibi", rollNo: "STD-004", avatar: "https://i.pravatar.cc/150?img=9" }
  ]);

  const [studentGroups] = useState<StudentGroup[]>([
    { id: 1, name: "Science Batch A", studentCount: 25 },
    { id: 2, name: "Arts Batch B", studentCount: 18 },
    { id: 3, name: "Computer Science C", studentCount: 30 }
  ]);

  const mockTeachers = ["Mr. Smith", "Ms. Johnson", "Dr. Ali", "Prof. Davis"];
  const mockCourses = ["Mathematics 101", "Physics", "Chemistry", "English Literature", "Computer Science"];

  // --- Class Data State ---
  const [classes, setClasses] = useState<ClassModel[]>([
    { id: 1, name: "Grade 10 - Section A", teachers: ["Mr. Smith", "Ms. Johnson"], courses: ["Mathematics 101", "Physics"], studentIds: [1, 2], groupIds: [1] },
    { id: 2, name: "Grade 9 - Section B", teachers: ["Dr. Ali"], courses: ["Chemistry", "Computer Science"], studentIds: [3, 4], groupIds: [3] }
  ]);

  // --- UI States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Form State
  const [classForm, setClassForm] = useState<ClassModel>({
    id: 0, name: "", teachers: [], courses: [], studentIds: [], groupIds: []
  });

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // --- Handlers ---
  const handleOpenModal = (cls?: ClassModel) => {
    if (cls) {
      setClassForm({ ...cls });
    } else {
      setClassForm({ id: 0, name: "", teachers: [], courses: [], studentIds: [], groupIds: [] });
    }
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (classForm.id !== 0) {
      setClasses(classes.map(c => c.id === classForm.id ? classForm : c));
    } else {
      setClasses([...classes, { ...classForm, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClass = (id: number) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      setClasses(classes.filter(c => c.id !== id));
    }
    setOpenMenuId(null);
  };

  // Generic toggle for checkbox arrays
  const toggleArrayField = (field: keyof ClassModel, value: any) => {
    setClassForm(prev => {
      const arr = prev[field] as any[];
      return { ...prev, [field]: arr.includes(value) ? arr.filter(item => item !== value) : [...arr, value] };
    });
  };

  return (
    <div className="admin-page-container">
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Class Management</h2>
        <button className="btn btn-primary" style={{ backgroundColor: '#1e3a8a' }} onClick={() => handleOpenModal()}>
          <FontAwesomeIcon icon={faPlus} /> Create New Class
        </button>
      </div>

      {/* Class Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {classes.length > 0 ? classes.map(cls => (
            <div key={cls.id} className="card" style={{ 
              padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', 
              borderTop: '4px solid var(--color-primary-500)', transition: 'transform 0.2s, box-shadow 0.2s' 
            }}>
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>{cls.name}</h3>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>
                      <FontAwesomeIcon icon={faLayerGroup} style={{ marginRight: '0.3rem' }}/> {cls.groupIds.length} Groups
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>
                      <FontAwesomeIcon icon={faUsers} style={{ marginRight: '0.3rem' }}/> {cls.studentIds.length} Individual Students
                    </span>
                  </div>
                </div>
                <div className="action-btn-wrapper">
                  <button className="btn action-btn" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === cls.id ? null : cls.id); }}>
                    <FontAwesomeIcon icon={faEllipsisH} />
                  </button>
                  {openMenuId === cls.id && (
                    <div className="action-menu-dropdown">
                      <button className="dropdown-item" onClick={() => handleOpenModal(cls)}><FontAwesomeIcon icon={faEdit} fixedWidth /> Edit Class</button>
                      <button className="dropdown-item danger" onClick={() => handleDeleteClass(cls.id)}><FontAwesomeIcon icon={faTrash} fixedWidth /> Delete Class</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Resource Badges Area */}
              <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #f3f4f6', flexGrow: 1 }}>
                
                {/* Teachers */}
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                      <FontAwesomeIcon icon={faChalkboardTeacher} /> Assigned Teachers
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {cls.teachers.length > 0 ? cls.teachers.map(t => (
                        <span key={t} style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>{t}</span>
                      )) : <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>No teachers assigned</span>}
                    </div>
                </div>

                {/* Courses */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                      <FontAwesomeIcon icon={faBook} /> Assigned Courses
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {cls.courses.length > 0 ? cls.courses.map(c => (
                        <span key={c} style={{ background: '#fef3c7', color: '#d97706', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>{c}</span>
                      )) : <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>No courses assigned</span>}
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
                onClick={() => handleOpenModal(cls)}
              >
                Manage Class Options
              </button>
            </div>
        )) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#6b7280', background: 'white', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
            <FontAwesomeIcon icon={faChalkboardTeacher} size="3x" style={{ color: '#e5e7eb', marginBottom: '1rem' }} />
            <p>No classes created yet. Click "Create New Class" to get started.</p>
          </div>
        )}
      </div>

      {/* --- MODAL: CLASS MANAGEMENT --- */}
      {isModalOpen && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ width: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="owner-modal-header" style={{ display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
              <h3 style={{ margin: 0 }}>{classForm.id === 0 ? "Create New Class" : "Manage Class"}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} size="lg" color="#6b7280" /></button>
            </div>
            
            <form onSubmit={handleSaveClass} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="owner-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f9fafb', overflowY: 'auto', padding: '1.5rem' }}>
                
                {/* Class Name */}
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <label className="auth-label">Class Name</label>
                  <input className="auth-input" required value={classForm.name} onChange={e => setClassForm({...classForm, name: e.target.value})} placeholder="e.g. Grade 10 - Section A" />
                </div>

                {/* Grid 1: Teachers & Courses */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <label className="auth-label" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', display: 'block', marginBottom: '0.5rem' }}>
                      Assign Teachers
                    </label>
                    <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {mockTeachers.map(teacher => (
                        <label key={teacher} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.2s' }} className="hover:bg-gray-50">
                          <input type="checkbox" checked={classForm.teachers.includes(teacher)} onChange={() => toggleArrayField("teachers", teacher)} />
                          <span style={{ fontSize: '0.85rem', color: '#374151' }}>{teacher}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <label className="auth-label" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', display: 'block', marginBottom: '0.5rem' }}>
                      Assign Courses
                    </label>
                    <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {mockCourses.map(course => (
                        <label key={course} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.2s' }}>
                          <input type="checkbox" checked={classForm.courses.includes(course)} onChange={() => toggleArrayField("courses", course)} />
                          <span style={{ fontSize: '0.85rem', color: '#374151' }}>{course}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grid 2: Groups & Individual Students */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  
                  {/* Assign Entire Groups */}
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <label className="auth-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                      Add Student Groups ({classForm.groupIds.length} Selected)
                    </label>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem' }}>Assigning a group adds all its members to this class.</p>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                      {studentGroups.map(group => (
                        <label key={group.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', margin: 0 }}>
                          <input type="checkbox" checked={classForm.groupIds.includes(group.id)} onChange={() => toggleArrayField("groupIds", group.id)} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#111827' }}>{group.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{group.studentCount} Students</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Assign Individual Students */}
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <label className="auth-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                      Add Individual Students ({classForm.studentIds.length} Selected)
                    </label>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem' }}>Add standalone students not already in the groups.</p>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                      {students.map(student => (
                        <label key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', margin: 0 }}>
                          <input type="checkbox" checked={classForm.studentIds.includes(student.id)} onChange={() => toggleArrayField("studentIds", student.id)} />
                          <img src={student.avatar} alt="Pfp" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#111827' }}>{student.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>{student.rollNo}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
              <div className="owner-modal-footer" style={{ flexShrink: 0 }}>
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)} style={{ background: 'white', border: '1px solid #d1d5db' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#1e3a8a' }}>{classForm.id === 0 ? "Create Class" : "Save Class"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
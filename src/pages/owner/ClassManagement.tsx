import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faChalkboard, faUserTie, faUsers, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

// Mock Data Interfaces
interface ClassItem {
  id: number;
  name: string;
  course: string;
  teacher: string;
  assignedGroups: string[];
}

export default function ClassManagement() {
  const [view, setView] = useState<"list" | "form">("list");
  
  // Mock Data
  const [classes, setClasses] = useState<ClassItem[]>([
    { id: 1, name: "Morning Session A", course: "CS101", teacher: "Mr. Smith", assignedGroups: ["Class 10-A"] }
  ]);
  const mockTeachers = ["Mr. Smith", "Ms. Johnson", "Dr. Ali"];
  const mockCourses = ["CS101", "MAT201", "ENG101"];
  const mockGroups = ["Class 10-A", "Class 10-B", "Class 9-A"];

  const [formData, setFormData] = useState({ name: "", course: "", teacher: "", assignedGroups: [] as string[] });
  const [editingId, setEditingId] = useState<number | null>(null);

  const toggleGroup = (group: string) => {
    setFormData(prev => {
      if (prev.assignedGroups.includes(group)) {
        return { ...prev, assignedGroups: prev.assignedGroups.filter(g => g !== group) };
      }
      return { ...prev, assignedGroups: [...prev.assignedGroups, group] };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setClasses(classes.map(c => c.id === editingId ? { ...c, ...formData } : c));
    } else {
      setClasses([...classes, { id: Date.now(), ...formData }]);
    }
    setView("list");
    setEditingId(null);
    setFormData({ name: "", course: "", teacher: "", assignedGroups: [] });
  };

  if (view === "form") {
    return (
       <div className="card settings-container">
         <button className="btn" onClick={() => setView("list")} style={{marginBottom: '1rem'}}><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
         <h3 className="card-title">{editingId ? "Update Class" : "Create Class"}</h3>
         <form onSubmit={handleSave} className="auth-form">
           <label className="auth-label">Class Name</label>
           <input className="auth-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Fall 2024 Section A" />
           <div style={{height:'1rem'}}/>
           
           <div className="form-grid">
             <div>
               <label className="auth-label">Select Course</label>
               <select className="auth-input" required value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})}>
                 <option value="">-- Select Course --</option>
                 {mockCourses.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
             </div>
             <div>
               <label className="auth-label">Assign Teacher</label>
               <select className="auth-input" required value={formData.teacher} onChange={e => setFormData({...formData, teacher: e.target.value})}>
                 <option value="">-- Select Teacher --</option>
                 {mockTeachers.map(t => <option key={t} value={t}>{t}</option>)}
               </select>
             </div>
           </div>

           <div style={{height:'1rem'}}/>
           <label className="auth-label">Assign Student Groups</label>
           <div style={{display:'flex', flexWrap:'wrap', gap:'0.5rem', marginTop:'0.5rem'}}>
             {mockGroups.map(g => (
               <button 
                 type="button" 
                 key={g} 
                 onClick={() => toggleGroup(g)}
                 style={{
                   padding: '0.5rem 1rem', 
                   borderRadius: '20px', 
                   border: '1px solid #ddd',
                   background: formData.assignedGroups.includes(g) ? 'var(--color-primary-500)' : '#fff',
                   color: formData.assignedGroups.includes(g) ? '#fff' : '#333',
                   cursor: 'pointer'
                 }}
               >
                 {g}
               </button>
             ))}
           </div>

           <div style={{height:'1.5rem'}}/>
           <button type="submit" className="btn btn-primary">{editingId ? "Update" : "Create"}</button>
         </form>
       </div>
    );
  }

  return (
    <div>
      <div className="toolbar">
        <h3>Classes</h3>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData({name:"",course:"",teacher:"",assignedGroups:[]}); setView("form"); }}>
           <FontAwesomeIcon icon={faPlus} /> Add Class
        </button>
      </div>
      <div className="card-grid">
        {classes.map(c => (
          <div key={c.id} className="stat-card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
              <h3 className="card-title" style={{color:'#000', fontWeight:'bold'}}>{c.name}</h3>
              <div style={{display:'flex', gap:'0.25rem'}}>
                 <button className="btn action-btn" onClick={() => { setEditingId(c.id); setFormData(c); setView("form"); }}><FontAwesomeIcon icon={faEdit}/></button>
                 <button className="btn action-btn btn-delete" onClick={() => setClasses(classes.filter(i => i.id !== c.id))}><FontAwesomeIcon icon={faTrash}/></button>
              </div>
            </div>
            
            <div style={{fontSize:'0.9rem', color:'#555', marginBottom:'0.5rem'}}>
               <span style={{fontWeight:'bold', color:'var(--color-primary-500)'}}>{c.course}</span>
            </div>

            <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem', fontSize:'0.9rem', color:'#666'}}>
               <FontAwesomeIcon icon={faUserTie} /> {c.teacher}
            </div>

            <div className="assignment-section">
              <div style={{fontSize:'0.8rem', color:'#666', marginBottom:'0.25rem'}}>
                 <FontAwesomeIcon icon={faUsers} /> Assigned Groups:
              </div>
              <div className="assignment-list">
                 {c.assignedGroups.map(g => (
                   <span key={g} className="assignment-tag">{g}</span>
                 ))}
                 {c.assignedGroups.length === 0 && <span style={{fontStyle:'italic', fontSize:'0.8rem'}}>None</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
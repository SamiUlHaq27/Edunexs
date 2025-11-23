import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldAlt, faPlus, faCheck } from "@fortawesome/free-solid-svg-icons";

const PERMISSIONS = ["manage_students", "manage_courses", "manage_attendance", "view_finance", "edit_finance", "system_settings"];

export default function RoleManagement(): React.JSX.Element {
  const [roles, setRoles] = useState([
    { id: 1, title: "Teacher", permissions: ["manage_students", "manage_attendance"] },
    { id: 2, title: "Clerk", permissions: ["manage_students", "view_finance"] }
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [newRole, setNewRole] = useState({ title: "", permissions: [] as string[] });

  const togglePermission = (perm: string) => {
    setNewRole(prev => {
      const has = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: has ? prev.permissions.filter(p => p !== perm) : [...prev.permissions, perm]
      };
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setRoles([...roles, { id: Date.now(), ...newRole }]);
    setIsCreating(false);
    setNewRole({ title: "", permissions: [] });
  };

  return (
    <div>
      <div className="toolbar">
        <h3>Custom Roles</h3>
        <button className="btn btn-primary" onClick={() => setIsCreating(!isCreating)}>
           <FontAwesomeIcon icon={faPlus} /> Create New Role
        </button>
      </div>

      <div className="card-grid">
        {/* Creation Form */}
        {isCreating && (
           <div className="card role-creation-card">
             <form onSubmit={handleCreate}>
               <h4 className="auth-label" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Define New Role</h4>
               
               <div style={{ marginBottom: '1.5rem' }}>
                 <label className="auth-label">Role Title</label>
                 <input 
                   className="auth-input" 
                   value={newRole.title} 
                   onChange={e => setNewRole({...newRole, title: e.target.value})} 
                   placeholder="e.g., Head of Department"
                   required 
                 />
               </div>
               
               <label className="auth-label">Assign Permissions</label>
               <div className="permissions-grid">
                 {PERMISSIONS.map(perm => (
                   <label key={perm} className="permission-item">
                     <input 
                        type="checkbox" 
                        checked={newRole.permissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                     />
                     <span className="permission-label">{perm.replace('_', ' ')}</span>
                   </label>
                 ))}
               </div>
               <div className="form-actions">
                 <button type="button" className="btn" onClick={() => setIsCreating(false)}>Cancel</button>
                 <button type="submit" className="btn btn-primary">Save Role</button>
               </div>
             </form>
           </div>
        )}

        {/* Role Cards */}
        {roles.map(role => (
          <div key={role.id} className="stat-card">
            <div className="role-header">
              <div className="role-icon-box">
                <FontAwesomeIcon icon={faShieldAlt} size="lg" />
              </div>
              <h3 className="card-title" style={{ margin: 0, color: 'var(--color-text-primary)', fontWeight: 'bold' }}>
                {role.title}
              </h3>
            </div>
            <div className="role-tags">
              {role.permissions.map(perm => (
                <span key={perm} className="perm-tag">
                  {perm.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
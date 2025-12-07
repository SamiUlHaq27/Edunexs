import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, faFilter, faEllipsisH, faCheckCircle, 
  faBan, faTimes, faPaperPlane, faExclamationTriangle 
} from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../../config/assets";

interface Institution {
  id: number;
  name: string;
  type: "University" | "College" | "School";
  location: string;
  regDate: string;
  status: "Unblocked" | "Blocked";
  logo: string;
}

export default function SystemAdminInstitutions() {
  const [institutions, setInstitutions] = useState<Institution[]>([
    { id: 1, name: "Tech University", type: "University", location: "Karachi, Pakistan", regDate: "Dec 1, 2025", status: "Unblocked", logo: ASSETS.logo },
    { id: 2, name: "Greenwood College", type: "College", location: "Gujrat, Pakistan", regDate: "Nov 28, 2025", status: "Blocked", logo: ASSETS.logo },
    { id: 3, name: "Maple Leaf School", type: "School", location: "Lahore, Pakistan", regDate: "Nov 25, 2025", status: "Blocked", logo: ASSETS.logo },
    { id: 4, name: "Global Institute", type: "University", location: "Lahore, Pakistan", regDate: "Nov 20, 2025", status: "Unblocked", logo: ASSETS.logo },
  ]);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstId, setSelectedInstId] = useState<number | null>(null);
  const [blockMessage, setBlockMessage] = useState("");

  const handleActionClick = (id: number, action: "Block" | "Unblock") => {
    setOpenMenuId(null); // Close menu
    
    if (action === "Block") {
      // Open Modal for Blocking
      setSelectedInstId(id);
      setBlockMessage(""); // Reset message
      setIsModalOpen(true);
    } else {
      // Direct Unblock
      setInstitutions(institutions.map(inst => 
        inst.id === id ? { ...inst, status: "Unblocked" } : inst
      ));
    }
  };

  const confirmBlock = () => {
    if (selectedInstId !== null) {
      setInstitutions(institutions.map(inst => 
        inst.id === selectedInstId ? { ...inst, status: "Blocked" } : inst
      ));
      
      // Simulate sending message
      console.log(`Sending message to owner of ID ${selectedInstId}: ${blockMessage}`);
      alert(`Institution blocked and message sent to owner.`);
      
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInstId(null);
  };

  // Helper to get selected institution name
  const selectedInstName = institutions.find(i => i.id === selectedInstId)?.name;

  return (
    <div onClick={() => setOpenMenuId(null)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
         <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Registered Institutions</h2>
         <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div className="input-with-icon" style={{ margin: 0, width: '250px' }}>
               <span className="input-icon"><FontAwesomeIcon icon={faSearch} /></span>
               <input className="auth-input" placeholder="Search..." style={{ height: '40px' }} />
            </div>
            <button className="btn" style={{ height: '40px', background: '#fff', border: '1px solid #d1d5db' }}>
               Filter <FontAwesomeIcon icon={faFilter} />
            </button>
         </div>
      </div>

      <div className="card table-container">
         <table className="data-table sys-admin-table">
            <thead>
               <tr>
                  <th>Logo</th>
                  <th>Institution Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Registered Date</th>
                  <th>Status</th>
                  <th>Actions</th>
               </tr>
            </thead>
            <tbody>
               {institutions.map(inst => (
                  <tr key={inst.id}>
                     <td>
                        <img src={inst.logo} alt="Logo" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #eee', objectFit: 'cover' }} />
                     </td>
                     <td style={{ fontWeight: '600', fontSize: '1rem' }}>{inst.name}</td>
                     <td>{inst.type}</td>
                     <td>{inst.location}</td>
                     <td>{inst.regDate}</td>
                     <td>
                        <span className={`status-pill ${inst.status === 'Unblocked' ? 'status-unblocked' : 'status-blocked'}`}>
                           {inst.status}
                        </span>
                     </td>
                     <td>
                        <div className="action-menu-wrapper" onClick={(e) => e.stopPropagation()}>
                           <button className="action-menu-btn" onClick={() => setOpenMenuId(openMenuId === inst.id ? null : inst.id)}>
                              <FontAwesomeIcon icon={faEllipsisH} />
                           </button>
                           
                           {openMenuId === inst.id && (
                              <div className="action-dropdown" style={{ minWidth: '150px' }}>
                                 {inst.status === 'Unblocked' ? (
                                    <button className="dropdown-item" onClick={() => handleActionClick(inst.id, "Block")}>
                                       <FontAwesomeIcon icon={faBan} style={{ color: '#dc2626' }} fixedWidth /> 
                                       <span style={{ color: '#dc2626' }}>Block</span>
                                    </button>
                                 ) : (
                                    <button className="dropdown-item" onClick={() => handleActionClick(inst.id, "Unblock")}>
                                       <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#059669' }} fixedWidth /> 
                                       <span style={{ color: '#059669' }}>Unblock</span>
                                    </button>
                                 )}
                              </div>
                           )}
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* --- Confirmation & Message Modal --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                 <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#f59e0b', marginRight: '0.5rem' }} />
                 Block Institution
              </h3>
              <button className="btn action-btn" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="modal-body">
              <p style={{ color: '#374151', marginBottom: '1rem' }}>
                Are you sure you want to block <strong>{selectedInstName}</strong>? 
                This will restrict access for all associated users.
              </p>
              
              <label className="auth-label" style={{ display: 'block', marginBottom: '0.25rem' }}>
                 Reason for blocking (Message to Owner)
              </label>
              <textarea 
                className="textarea-field" 
                placeholder="e.g. Violation of terms of service..."
                value={blockMessage}
                onChange={(e) => setBlockMessage(e.target.value)}
                autoFocus
              ></textarea>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                 This message will be sent via email to the institution owner.
              </p>
            </div>

            <div className="modal-footer">
               <button className="btn" onClick={closeModal} style={{ background: '#fff', border: '1px solid #d1d5db' }}>
                 Cancel
               </button>
               <button 
                 className="btn btn-primary" 
                 style={{ background: '#dc2626', borderColor: '#dc2626' }}
                 onClick={confirmBlock}
                 disabled={!blockMessage.trim()} // Prevent empty messages if required
               >
                 <FontAwesomeIcon icon={faPaperPlane} /> Confirm & Send
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
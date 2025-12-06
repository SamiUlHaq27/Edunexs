import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faLock } from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../../config/assets";
import "../../styles/owner.css";

export default function InstitutionSettings(): React.JSX.Element {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial State
  const [data, setData] = useState<{
    name: string;
    prefix: string;
    description: string;
    country: string;
    city: string;
    address: string;
    logo: string;
    banner: string;
  }>({
    name: "EDUNEXS",
    prefix: "INST-",
    description: "A leading educational body committed to excellence, to number of campus, university and psychology for education and future.",
    country: "Pakistan",
    city: "Gujrat",
    address: "University Road",
    logo: ASSETS.logo,
    banner: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  });

  // Load initial data from LocalStorage if available
  useEffect(() => {
    const savedProfile = localStorage.getItem("institution_profile");
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setData(prev => ({
        ...prev,
        name: parsed.name || prev.name,
        logo: parsed.logo || prev.logo,
        prefix: parsed.prefix || prev.prefix
      }));
    }
  }, []);

  const [formData, setFormData] = useState(data);

  const handleEditClick = () => {
    setFormData(data);
    setIsEditModalOpen(true);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // --- SAVE HANDLER (Updated with Validation) ---
  const handleSave = () => {
    // 1. Validation Check
    if (!formData.name.trim() || !formData.city.trim() || !formData.address.trim()) {
      alert("Fields cannot be empty. Please fill in all required details.");
      return;
    }

    // 2. Update Local State
    setData(formData);
    setIsEditModalOpen(false);

    // 3. Update Local Storage for global access
    const profileToSave = {
      name: formData.name,
      logo: formData.logo,
      prefix: formData.prefix
    };
    localStorage.setItem("institution_profile", JSON.stringify(profileToSave));

    // 4. Dispatch Event to notify OwnerLayout (Topbar)
    window.dispatchEvent(new Event("institution_profile_updated"));

    alert("Changes saved successfully!");
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: 'bold' }}>Institution Details</h2>

      {/* Banner */}
      <img src={data.banner} alt="Campus Banner" className="inst-banner" />

      {/* Profile Details Card */}
      <div className="inst-profile-card">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
           <img src={data.logo} alt="Logo" className="inst-logo-large" />
          
        </div>
        
        <div className="inst-info">
          <h3 className="inst-name" style={{ fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '1px' }}> {data.name}</h3>
          <p className="inst-desc">{data.description}</p>
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
             <strong>Location:</strong> {data.address}, {data.city}, {data.country}
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleEditClick} style={{ alignSelf: 'center', padding: '0.75rem 1.5rem' }}>
          Edit Details
        </button>
      </div>

      {/* Bottom Section */}
      <div className="inst-bottom-grid">
        <div className="inst-events-panel">
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>Upcoming Events & Calendar</h3>
          <div className="event-list">
            <div className="event-item">
              <span className="event-date">Dec 10 - Faculty Meeting</span>
            </div>
            <div className="event-item">
              <span className="event-date">Dec 15 - End of Semester Exam</span>
            </div>
            <div className="event-item" style={{ borderBottom: 'none' }}>
              <span className="event-date">Dec 20 - Winter Break Begins</span>
            </div>
          </div>
        </div>

        <div className="inst-calendar-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <button className="btn btn-icon" style={{ padding: 0 }}><FontAwesomeIcon icon={faChevronLeft} /></button>
            <span style={{ fontWeight: 'bold' }}>December 2025</span>
            <button className="btn btn-icon" style={{ padding: 0 }}><FontAwesomeIcon icon={faChevronRight} /></button>
          </div>
          
          <div className="mini-calendar-grid">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="mini-cal-header">{d}</div>)}
            <div /> 
            {Array.from({length: 31}, (_, i) => i + 1).map(day => (
              <div 
                key={day} 
                className={`mini-cal-day ${day === 10 || day === 15 || day === 20 ? 'today' : ''} ${day === 10 ? 'active' : ''}`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="owner-modal-overlay">
          <div className="owner-modal">
            <div className="owner-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Edit Institution Details</h3>
            </div>
            <div className="owner-modal-body">
              {/* Fields */}
              <div>
                <label className="auth-label">Prefix</label>
                <div className="input-with-icon" style={{ marginBottom: 0 }}>
                  <input className="auth-input" value={formData.prefix} disabled style={{ backgroundColor: '#f3f4f6' }} />
                  <span className="input-right-icon"><FontAwesomeIcon icon={faLock} color="#9ca3af" /></span>
                </div>
              </div>
              <div>
                <label className="auth-label">Name <span style={{color:'red'}}>*</span></label>
                <input 
                  className="auth-input" 
                  value={formData.name} 
                  onChange={(e) => handleChange("name", e.target.value)} 
                  required
                />
              </div>
              <div className="logo-edit-row">
                <div>
                  <label className="auth-label">Logo</label>
                  <div className="logo-preview-box">
                    <img src={formData.logo} alt="Preview" className="logo-preview-img" />
                  </div>
                </div>
                <div>
                   <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleLogoChange} />
                   <button className="btn btn-primary" onClick={triggerFileSelect} style={{ marginTop: '1rem' }}>Change Logo</button>
                </div>
              </div>
              <div>
                <label className="auth-label">Country</label>
                <select className="auth-input" value={formData.country} onChange={(e) => handleChange("country", e.target.value)}>
                  <option value="Pakistan">Pakistan</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                </select>
              </div>
              <div>
                <label className="auth-label">City <span style={{color:'red'}}>*</span></label>
                <input 
                  className="auth-input" 
                  value={formData.city} 
                  onChange={(e) => handleChange("city", e.target.value)}
                  required 
                />
              </div>
              <div>
                <label className="auth-label">Address <span style={{color:'red'}}>*</span></label>
                <textarea 
                  className="auth-input" 
                  rows={2} 
                  value={formData.address} 
                  onChange={(e) => handleChange("address", e.target.value)} 
                  style={{ fontFamily: 'inherit' }}
                  required
                />
              </div>
            </div>
            <div className="owner-modal-footer">
              <button className="btn" onClick={() => setIsEditModalOpen(false)} style={{ background: 'white', border: '1px solid #d1d5db' }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
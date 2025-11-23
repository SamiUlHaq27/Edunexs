import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faMapMarkerAlt, faGlobe, faUpload, faSave } from "@fortawesome/free-solid-svg-icons";

export default function InstitutionSettings(): React.JSX.Element {
  // Simulating fetching existing data
  const [formData, setFormData] = useState({
    name: "Edunexs Academy",
    country: "Pakistan",
    city: "Gujrat",
    address: "123 Education Ave, Punjab",
    logo: null as File | null
  });
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, logo: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to PUT /api/v1/institution/settings
    alert("Institution details updated successfully!");
  };

  return (
    <div className="card settings-container">
      <div className="chart-header">
         <div>
            <h3 className="card-title" style={{ fontSize: '1.25rem', color: '#111827' }}>Institution Profile</h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Update your organization's public information.</p>
         </div>
      </div>
      
      <form onSubmit={handleSubmit} className="auth-form">
        {/* Logo Section */}
        <div className="logo-upload-section">
          <div className="logo-preview">
            {preview ? (
              <img src={preview} alt="Preview" />
            ) : (
              <FontAwesomeIcon icon={faBuilding} className="logo-icon" />
            )}
          </div>
          <div>
            <label htmlFor="logo-upload" className="btn btn-primary upload-label">
              <FontAwesomeIcon icon={faUpload} /> Change Logo
            </label>
            <input 
              id="logo-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleLogoChange} 
              style={{ display: 'none' }} 
            />
            <p className="upload-hint">Recommended: 200x200px PNG or JPG</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="form-grid">
          <div>
            <label className="auth-label" htmlFor="name">Institution Name</label>
            <div className="input-with-icon">
              <span className="input-icon"><FontAwesomeIcon icon={faBuilding} /></span>
              <input
                id="name"
                type="text"
                className="auth-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="auth-label" htmlFor="country">Country</label>
            <div className="input-with-icon">
              <span className="input-icon"><FontAwesomeIcon icon={faGlobe} /></span>
              <input
                id="country"
                type="text"
                className="auth-input"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="auth-label" htmlFor="city">City</label>
            <div className="input-with-icon">
              <span className="input-icon"><FontAwesomeIcon icon={faMapMarkerAlt} /></span>
              <input
                id="city"
                type="text"
                className="auth-input"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="auth-label" htmlFor="address">Address</label>
            <div className="input-with-icon">
              <span className="input-icon"><FontAwesomeIcon icon={faMapMarkerAlt} /></span>
              <input
                id="address"
                type="text"
                className="auth-input"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-actions" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
            <FontAwesomeIcon icon={faSave} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
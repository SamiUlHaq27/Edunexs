import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBuilding, 
  faGlobe, 
  faMapMarkerAlt, 
  faUpload, 
  faArrowRight 
} from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../config/assets";
import AuthSidebar from "../components/AuthSidebar";

export default function CreateInstitution(): React.JSX.Element {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    city: "",
    address: "",
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
    
    // Helper to save and redirect
    const saveToStorageAndRedirect = (logoData: string | null) => {
      const profile = {
        name: formData.name,
        logo: logoData || ASSETS.logo // Use uploaded logo or default
      };
      
      // Save to localStorage so other dashboards can read it
      localStorage.setItem("institution_profile", JSON.stringify(profile));
      
      alert(`Institution "${formData.name}" created!`);
      navigate("/owner/dashboard");
    };

    // Process image to Base64 string for storage
    if (formData.logo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        saveToStorageAndRedirect(reader.result as string);
      };
      reader.readAsDataURL(formData.logo);
    } else {
      saveToStorageAndRedirect(null);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-split">
        <div className="auth-card">
          <img src={ASSETS.logo} alt="Logo" className="auth-logo" />
          <h2 className="auth-title">Setup Institution</h2>
          <p className="auth-subtitle">
            Enter your institution's details to get started.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Logo Upload */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ 
                   width: '100px', height: '100px', margin: '0 auto 1rem',
                   borderRadius: '50%', background: '#f3f4f6', border: '2px dashed #d1d5db',
                   display: 'grid', placeItems: 'center', overflow: 'hidden'
                 }}>
                   {preview ? (
                     <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   ) : (
                     <FontAwesomeIcon icon={faBuilding} style={{ fontSize: '2rem', color: '#9ca3af' }} />
                   )}
                 </div>
                 <label htmlFor="logo-upload" className="link" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                   <FontAwesomeIcon icon={faUpload} /> Upload Logo
                 </label>
                 <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
               </div>
            </div>

            <label className="auth-label" htmlFor="name">Institution Name</label>
            <div className="input-with-icon">
              <span className="input-icon"><FontAwesomeIcon icon={faBuilding} /></span>
              <input
                id="name"
                type="text"
                className="auth-input"
                placeholder="e.g. Edunexs Academy"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <label className="auth-label" htmlFor="country">Country</label>
            <div className="input-with-icon">
              <span className="input-icon"><FontAwesomeIcon icon={faGlobe} /></span>
              <input
                id="country"
                type="text"
                className="auth-input"
                placeholder="e.g. Pakistan"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="auth-label" htmlFor="city">City</label>
                <div className="input-with-icon">
                  <span className="input-icon"><FontAwesomeIcon icon={faMapMarkerAlt} /></span>
                  <input
                    id="city"
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Lahore"
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
                    placeholder="Street 123..."
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit">
              Create & Continue <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </form>
        </div>
        <AuthSidebar />
      </div>
    </div>
  );
}
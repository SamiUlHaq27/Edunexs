import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt, faFileAlt, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function StudentAssignmentSubmit() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);

  const handleDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="card settings-container">
       <button className="btn" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
         <FontAwesomeIcon icon={faArrowLeft} /> Back to Courses
       </button>
       
       <div className="student-header-card">
          <h2 style={{ margin: 0 }}>Algebra Chapter 3</h2>
          <p style={{ opacity: 0.9, marginTop: '0.5rem' }}>Due: 30 Nov 2024 • 20 Marks</p>
       </div>

       <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Instructions</h4>
          <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
            Please solve the exercises on pages 45-48. Scanned copies of handwriting or PDF exports are accepted.
          </p>
       </div>

       <h4 style={{ marginBottom: '1rem' }}>Your Submission</h4>
       <div className="upload-zone">
          <input type="file" id="file-upload" style={{ display: 'none' }} onChange={handleDrop} />
          {file ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
               <FontAwesomeIcon icon={faFileAlt} size="2x" color="#0066ff" />
               <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold' }}>{file.name}</div>
                  <div style={{ fontSize: '0.8rem' }}>{(file.size / 1024).toFixed(2)} KB</div>
               </div>
               <button className="btn" onClick={(e) => { e.preventDefault(); setFile(null); }} style={{ color: 'red' }}>Remove</button>
            </div>
          ) : (
            <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
               <FontAwesomeIcon icon={faCloudUploadAlt} size="3x" style={{ marginBottom: '1rem', color: '#9ca3af' }} />
               <p style={{ fontWeight: 'bold', color: '#374151' }}>Click to upload assignment</p>
               <p style={{ fontSize: '0.8rem' }}>PDF, DOCX, or JPG</p>
            </label>
          )}
       </div>

       <div style={{ marginTop: '2rem', textAlign: 'right' }}>
          <button className="btn btn-primary" disabled={!file} onClick={() => alert("Submitted!")}>
             Turn In Assignment
          </button>
       </div>
    </div>
  );
}
import React from "react";
import { Link } from "react-router-dom";
import { ASSETS } from "../config/assets";
import "../styles/auth.css"; // Reusing auth styles for hero layout

export default function Landing(): React.JSX.Element {
  return (
    <div className="auth-page" style={{ display: 'block' }}> {/* Override grid for simple landing */}
       <nav style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
             <img src={ASSETS.logo} alt="Logo" style={{ width: '32px', height: '32px' }} />
             Edunexs
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <Link to="/login" className="link">Login</Link>
             <Link to="/signup" className="btn btn-primary" style={{ textDecoration: 'none' }}>Get Started</Link>
          </div>
       </nav>

       <main style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
             Manage your institution with confidence
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
             Edunexs provides a comprehensive platform for owners, staff, and students to connect, learn, and grow together.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
             <Link to="/signup" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>
               Create Account
             </Link>
             <Link to="/login" className="btn" style={{ background: 'var(--color-surface-base)', border: '1px solid var(--color-border-default)' }}>
               Log In
             </Link>
          </div>
       </main>
    </div>
  );
}
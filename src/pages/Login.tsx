import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ASSETS } from '../config/assets'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faLock, faEye, faEyeSlash, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { faGoogle, faApple, faFacebook } from '@fortawesome/free-brands-svg-icons'

export default function Login(): React.JSX.Element {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // UI-only: no real auth. You can wire this later.
    alert(`Attempt login as ${email}`)
  }

  return (
    <div className="auth-page">
      <div className="auth-container auth-split has-divider">
        {/* Left: Login card */}
        <div className="auth-card">
          <img src={ASSETS.logo} alt={ASSETS.alt} className="auth-logo" loading="lazy" />
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to your account</p>

          {/* Tabs for switching */}
          <div className="tabs">
            <NavLink to="/login" className={({ isActive }) => `tab${isActive ? ' tab-active' : ''}`}>Sign In</NavLink>
            <NavLink to="/signup" className={({ isActive }) => `tab${isActive ? ' tab-active' : ''}`}>Signup</NavLink>
          </div>

          <form onSubmit={onSubmit} className="auth-form">
            <label className="auth-label" htmlFor="email">Email</label>
            <div className="input-with-icon">
              <span className="input-icon" aria-hidden>
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                id="email"
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <label className="auth-label" htmlFor="password">Password</label>
            <div className="input-with-icon has-right">
              <span className="input-icon" aria-hidden>
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-right-icon"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            <button type="submit" className="btn btn-primary auth-submit">Continue</button>
          </form>

          {/* Divider and socials */}
          <div className="auth-divider">
            <span className="line" />
            <span>Or continue with</span>
            <span className="line" />
          </div>
          <div className="social-list">
            <button type="button" className="social-btn" aria-label="Continue with Google">
              <FontAwesomeIcon icon={faGoogle} />
            </button>
            <button type="button" className="social-btn" aria-label="Continue with Apple">
              <FontAwesomeIcon icon={faApple} />
            </button>
            <button type="button" className="social-btn" aria-label="Continue with Facebook">
              <FontAwesomeIcon icon={faFacebook} />
            </button>
          </div>
          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/signup" className="link">Create one</Link>
          </p>
        </div>
        {/* Right: Visual hero pane */}
        <aside className="auth-hero" aria-hidden>
          <img src="/auth-hero.png" alt="" className="hero-illustration" />
        </aside>
      </div>
    </div>
  )
}

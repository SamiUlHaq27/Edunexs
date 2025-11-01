import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ASSETS } from '../config/assets'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

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
    <div className="auth-container">
  <div className="auth-card">
  <img src={ASSETS.logo} alt={ASSETS.alt} className="auth-logo" loading="lazy" />
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account</p>
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

          <button type="submit" className="btn btn-primary auth-submit">Sign in</button>
        </form>
        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/signup" className="link">Create one</Link>
        </p>
      </div>
    </div>
  )
}

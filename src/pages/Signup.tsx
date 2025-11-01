import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ASSETS } from '../config/assets'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

export default function Signup(): React.JSX.Element {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password !== confirm) {
      alert('Passwords do not match')
      return
    }
    // UI-only: no real signup. Wire up later.
    alert(`Attempt signup: ${name} <${email}>`)
  }

  return (
    <div className="auth-container">
  <div className="auth-card">
        <img src={ASSETS.logo} alt={ASSETS.alt} className="auth-logo" loading="lazy" />
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">It only takes a minute</p>
        <form onSubmit={onSubmit} className="auth-form">
          <label className="auth-label" htmlFor="name">Full name</label>
          <div className="input-with-icon">
            <span className="input-icon" aria-hidden>
              <FontAwesomeIcon icon={faUser} />
            </span>
            <input
              id="name"
              type="text"
              className="auth-input"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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

          <label className="auth-label" htmlFor="confirm">Confirm password</label>
          <div className="input-with-icon has-right">
            <span className="input-icon" aria-hidden>
              <FontAwesomeIcon icon={faLock} />
            </span>
            <input
              id="confirm"
              type={showConfirm ? 'text' : 'password'}
              className="auth-input"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <button
              type="button"
              className="input-right-icon"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              onClick={() => setShowConfirm((v) => !v)}
            >
              <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
            </button>
          </div>

          <button type="submit" className="btn btn-primary auth-submit">Create account</button>
        </form>
        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

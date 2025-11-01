import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'

export default function App(): React.JSX.Element {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="app">
            <h1>Welcome to Edunexs</h1>
            <p style={{ marginTop: '0.5rem' }}>
              Explore the UI:{' '}
              <Link to="/login">Login</Link>
              {' '}•{' '}
              <Link to="/signup">Signup</Link>
            </p>
          </div>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

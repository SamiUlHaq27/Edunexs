import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faUsers,
  faBook,
  faCog,
  faSignOutAlt,
  faChevronLeft,
  faChevronRight,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../config/assets";
import "../styles/dashboard.css";

export default function AdminDashboard(): React.JSX.Element {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSidebar = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div
      className={`dashboard-layout ${isMinimized ? "sidebar-minimized" : ""}`}
    >
      {/* Sidebar overlay for mobile */}
      <div
        className="sidebar-overlay"
        onClick={() => setIsMinimized(true)}
        aria-hidden="true"
      />
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src={ASSETS.logo} alt={ASSETS.alt} className="sidebar-logo" />
        </div>
        <div className="sidebar-title-div">
          <button
            onClick={toggleSidebar}
            className="toggle-btn"
            aria-label="Toggle sidebar"
          >
            <FontAwesomeIcon
              icon={isMinimized ? faChevronRight : faChevronLeft}
            />
          </button>
          <h1 className="dashboard-sidebar-title">Admin Panel</h1>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className="nav-item" end>
            <FontAwesomeIcon icon={faTachometerAlt} className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </NavLink>
          <NavLink to="/admin/users" className="nav-item">
            <FontAwesomeIcon icon={faUsers} className="nav-icon" />
            <span className="nav-text">Users</span>
          </NavLink>
          <NavLink to="/admin/courses" className="nav-item">
            <FontAwesomeIcon icon={faBook} className="nav-icon" />
            <span className="nav-text">Courses</span>
          </NavLink>
          <NavLink to="/admin/settings" className="nav-item">
            <FontAwesomeIcon icon={faCog} className="nav-icon" />
            <span className="nav-text">Settings</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <NavLink to="/logout" className="nav-item">
            <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
            <span className="nav-text">Logout</span>
          </NavLink>
        </div>
      </aside>
      <main className="dashboard-main">
        <header className="main-header">
          <div className="header-greeting">
            <h2>Welcome, Admin!</h2>
            <p>
              {currentDateTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="header-profile">
            <div className="time-display">
              {currentDateTime.toLocaleTimeString("en-US")}
            </div>
            <div className="user-info">
              <span className="user-name">Sami Ul Haq</span>
              <span className="user-role">Administrator</span>
            </div>
            <FontAwesomeIcon icon={faUserCircle} className="user-avatar" />
          </div>
        </header>
        <div className="dashboard-content">
          {/* Placeholder cards */}
          <div className="card-grid">
            <div className="stat-card">
              <h3 className="card-title">Total Students</h3>
              <p className="card-value">1,250</p>
            </div>
            <div className="stat-card">
              <h3 className="card-title">Total Staff</h3>
              <p className="card-value">75</p>
            </div>
            <div className="stat-card">
              <h3 className="card-title">Active Courses</h3>
              <p className="card-value">42</p>
            </div>
            <div className="stat-card">
              <h3 className="card-title">Pending Approvals</h3>
              <p className="card-value">8</p>
            </div>
          </div>
          {/* Outlet for nested routes can go here if needed */}
          {/* <Outlet /> */}
        </div>
      </main>
    </div>
  );
}

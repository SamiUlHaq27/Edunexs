import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const images = ["/image1.jpg", "/image2.png", "/image3.jpg"];

export default function AuthSidebar() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <aside className="auth-sidebar">
      <div className="sidebar-slider">
        {images.map((src, index) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`slider-image ${index === currentImage ? "active" : ""}`}
          />
        ))}
      </div>
      <div className="sidebar-content">
        <h3 className="sidebar-title">Everything in one place</h3>
        <p className="sidebar-intro">
          Manage institutions, courses, attendance and assessments with a
          single, simple platform designed for owners, staff and students.
        </p>
        <ul className="feature-list">
          <li className="feature-item">
            <span className="icon" aria-hidden>
              <FontAwesomeIcon icon={faCheckCircle} />
            </span>
            Join multiple institutes with one account
          </li>
          <li className="feature-item">
            <span className="icon" aria-hidden>
              <FontAwesomeIcon icon={faCheckCircle} />
            </span>
            Role-based access for owners, staff and students
          </li>
          <li className="feature-item">
            <span className="icon" aria-hidden>
              <FontAwesomeIcon icon={faCheckCircle} />
            </span>
            Assignments, quizzes and attendance tracking
          </li>
          <li className="feature-item">
            <span className="icon" aria-hidden>
              <FontAwesomeIcon icon={faCheckCircle} />
            </span>
            Reports and fee management (coming soon)
          </li>
        </ul>
      </div>
    </aside>
  );
}

import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFileAlt, faClock, faClipboardList, faStar, faUserTie,
  faLaptopCode, faCalculator, faBook
} from "@fortawesome/free-solid-svg-icons";
import TeacherAssignments from "./TeacherAssignments"; 
import TeacherQuizzes from "./TeacherQuizzes"; 
import TeacherAttendance from "./TeacherAttendance";
import TeacherGrades from "./TeacherGrades";

export default function TeacherCourses() {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState<"assignments" | "quizzes" | "attendance" | "grades">("assignments");

  // 1. Dynamic Course Data: Colors, Instructors, and Icons
  const getCourseDetails = (id: string | undefined) => {
    switch (id?.toLowerCase()) {
      case "cs101":
        return {
          gradient: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", 
          label: "Computer Science",
          instructor: "Dr. Haider Ali",
          icon: faLaptopCode
        };
      case "math202":
        return {
          gradient: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", 
          label: "Mathematics",
          instructor: "Prof. Zain Ahmed",
          icon: faCalculator
        };
      case "eng301":
        return {
          gradient: "linear-gradient(135deg, #047857 0%, #10b981 100%)", 
          label: "English Literature",
          instructor: "Ms. Sara Khan",
          icon: faBook
        };
      default:
        return {
          gradient: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)", 
          label: id?.toUpperCase() || "General Course",
          instructor: "Lead Instructor",
          icon: faUserTie
        };
    }
  };

  const course = getCourseDetails(courseId);

  return (
    <div className="student-courses"> 
      
      {/* --- PREMIUM DYNAMIC BANNER --- */}
      <div className="student-header-card" style={{ 
        background: course.gradient, 
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>
              Course Details
            </span>
            <h2 style={{ margin: '10px 0', fontSize: '2.4rem', fontWeight: '800' }}>
              {course.label}
            </h2>
            <p style={{ opacity: 0.9, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FontAwesomeIcon icon={faUserTie} /> Instructor: {course.instructor}
            </p>
          </div>

          {/* Background Decorative Icon */}
          <FontAwesomeIcon icon={course.icon} style={{ 
            position: 'absolute', 
            right: '20px', 
            bottom: '-20px', 
            fontSize: '10rem', 
            opacity: 0.15, 
            transform: 'rotate(-15deg)' 
          }} />
      </div>

      {/* --- NAVIGATION TILES --- */}
      <div className="course-stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        <div onClick={() => setActiveTab("assignments")} style={movingCardStyle(activeTab === 'assignments', '#f59e0b')}>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706', padding: '12px', borderRadius: '12px' }}><FontAwesomeIcon icon={faFileAlt} size="lg" /></div>
          <div className="stat-info"><span className="stat-label" style={{ fontWeight: '700' }}>Assignment</span></div>
        </div>
        <div onClick={() => setActiveTab("quizzes")} style={movingCardStyle(activeTab === 'quizzes', '#6366f1')}>
          <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4338ca', padding: '12px', borderRadius: '12px' }}><FontAwesomeIcon icon={faClock} size="lg" /></div>
          <div className="stat-info"><span className="stat-label" style={{ fontWeight: '700' }}>Quiz</span></div>
        </div>
        <div onClick={() => setActiveTab("attendance")} style={movingCardStyle(activeTab === 'attendance', '#10b981')}>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#059669', padding: '12px', borderRadius: '12px' }}><FontAwesomeIcon icon={faClipboardList} size="lg" /></div>
          <div className="stat-info"><span className="stat-label" style={{ fontWeight: '700' }}>Attendance</span></div>
        </div>
        <div onClick={() => setActiveTab("grades")} style={movingCardStyle(activeTab === 'grades', '#8b5cf6')}>
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7c3aed', padding: '12px', borderRadius: '12px' }}><FontAwesomeIcon icon={faStar} size="lg" /></div>
          <div className="stat-info"><span className="stat-label" style={{ fontWeight: '700' }}>Gradebook</span></div>
        </div>
      </div>

      {/* --- DYNAMIC TAB CONTENT --- */}
      <div className="card settings-container" style={{ borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        {activeTab === "assignments" && <TeacherAssignments />}
        {activeTab === "quizzes" && <TeacherQuizzes />}
        {activeTab === "attendance" && <TeacherAttendance />}
        {activeTab === "grades" && <TeacherGrades />}
      </div>
    </div>
  );
}

const movingCardStyle = (isActive: boolean, color: string) => ({
  cursor: 'pointer',
  padding: '1.5rem',
  background: 'white',
  borderRadius: '16px',
  border: isActive ? `2px solid ${color}` : '1px solid #e5e7eb',
  boxShadow: isActive ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  transition: 'all 0.3s ease',
  transform: isActive ? 'translateY(-8px)' : 'translateY(0)',
});
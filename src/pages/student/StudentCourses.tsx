import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFileAlt, faClock, faUpload, faPlayCircle, 
  faCheckCircle, faChalkboardTeacher, faCalendarAlt, 
  faChartBar, faCommentDots, faTrophy, faTasks, 
  faArrowRight, faTimesCircle, faFileInvoiceDollar, faDownload
} from "@fortawesome/free-solid-svg-icons";

// Database
const COURSES_DATABASE: Record<number, any> = {
  1: {
    id: 1, title: "Mathematics 101", teacher: "Prof. Sarah Johnson", progress: 65, color: "#3b82f6", bg: "#eff6ff",
    assignments: [{ id: 101, title: "Algebra Chapter 3 Exercises", due: "Tomorrow, 11:59 PM", status: "pending" }],
    quizzes: [
      { id: 201, title: "Mid-Term Mock Quiz", duration: "30 Mins", status: "pending", marks: null },
      { id: 202, title: "Basic Math Quiz", duration: "15 Mins", status: "completed", marks: "15/20" }
    ],
    attendance: [{ date: "25 Dec 2025", status: "Present" }, { date: "24 Dec 2025", status: "Absent" }],
    grades: [{ title: "Geometry Project", type: "Assignment", score: "18/20", remarks: "Excellent work." }]
  },
  2: {
    id: 2, title: "Physics Fundamentals", teacher: "Dr. Alan Smith", progress: 40, color: "#10b981", bg: "#ecfdf5",
    assignments: [{ id: 102, title: "Thermodynamics Report", due: "10 Jan 2026", status: "pending" }],
    quizzes: [{ id: 203, title: "Laws of Motion Quiz", duration: "20 Mins", status: "completed", marks: "18/20" }],
    attendance: [{ date: "25 Dec 2025", status: "Present" }],
    grades: [{ title: "Laws of Motion Quiz", type: "Quiz", score: "18/20", remarks: "Good understanding." }]
  },
  3: {
    id: 3, title: "Computer Science", teacher: "Mr. David Lee", progress: 85, color: "#8b5cf6", bg: "#f5f3ff",
    assignments: [],
    quizzes: [{ id: 204, title: "Programming Basics", duration: "45 Mins", status: "pending", marks: null }],
    attendance: [{ date: "25 Dec 2025", status: "Present" }],
    grades: []
  }
};

// Fee Data for the Table
const FEE_HISTORY = [
  { id: 1, month: "March 2026", amount: "5,000", dueDate: "10 Mar 2026", status: "Paid" },
  { id: 2, month: "February 2026", amount: "5,000", dueDate: "10 Feb 2026", status: "Paid" },
  { id: 3, month: "January 2026", amount: "5,000", dueDate: "10 Jan 2026", status: "Unpaid" },
];

export default function StudentCourses() {
  const [activeTab, setActiveTab] = useState<"assignments" | "quizzes" | "attendance" | "grades">("assignments");
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Logic to determine if we should show Fees or Courses
  const isFeePage = location.pathname === "/student/fees";
  const activeCourseId = location.state?.courseId; 
  const courseData = activeCourseId ? COURSES_DATABASE[activeCourseId] : null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, activeCourseId, isFeePage]);

  // --- 1. FEES PAGE VIEW (Based on Screenshot) ---
  if (isFeePage) {
    return (
      <div className="student-course-page">
        <div className="student-hero-banner" style={{ background: 'linear-gradient(135deg, #8365f0 0%, #8365f0 100%)' }}>
          <div className="hero-content">
             <h1 className="hero-title">Fee Management</h1>
             <p className="hero-subtitle">Check your payment history and pending dues.</p>
          </div>
          <div className="hero-progress-box" style={{ width: 'auto' }}>
             <small style={{ color: '#6b7280' }}>Total Outstanding</small>
             <h2 style={{ margin: 0, color: '#ef4444' }}>Rs. 5,000</h2>
          </div>
        </div>

        <div className="tab-content-container" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
           <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#111827' }}>
              <FontAwesomeIcon icon={faFileInvoiceDollar} color="#059669" /> Fee History
           </h3>
           <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                 <thead>
                    <tr style={{ borderBottom: '2px solid #f3f4f6', color: '#6b7280', fontSize: '0.9rem' }}>
                       <th style={{ padding: '1rem' }}>Month</th>
                       <th style={{ padding: '1rem' }}>Amount</th>
                       <th style={{ padding: '1rem' }}>Due Date</th>
                       <th style={{ padding: '1rem' }}>Status</th>
                       <th style={{ padding: '1rem' }}>Action</th>
                    </tr>
                 </thead>
                 <tbody>
                    {FEE_HISTORY.map((fee) => (
                       <tr key={fee.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '1.2rem', fontWeight: '600', color: '#111827' }}>{fee.month}</td>
                          <td style={{ padding: '1.2rem' }}>Rs. {fee.amount}</td>
                          <td style={{ padding: '1.2rem', color: '#6b7280' }}>{fee.dueDate}</td>
                          <td style={{ padding: '1.2rem' }}>
                             <span className={`status-badge ${fee.status === 'Paid' ? 'badge-success' : 'badge-danger'}`}>
                                {fee.status}
                             </span>
                          </td>
                          <td style={{ padding: '1.2rem' }}>
                             {fee.status === 'Paid' ? (
                                <button className="btn btn-sm" style={{ background: '#eff6ff', color: '#2563eb', border: 'none' }}>
                                   <FontAwesomeIcon icon={faDownload} /> Receipt
                                </button>
                             ) : (
                                <button className="btn btn-primary btn-sm">Pay Now</button>
                             )}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    );
  }

  // --- 2. OVERVIEW DASHBOARD VIEW ---
  if (!activeCourseId) {
    return (
      <div className="student-course-page">
        <div className="student-hero-banner" style={{ background: 'linear-gradient(135deg, #0047ab 0%, #0047ab 100%)' }}>
          <div className="hero-content">
             <h1 className="hero-title" style={{ fontSize: '2rem' }}>Welcome back, Haider! 👋</h1>
             <p className="hero-subtitle">Here is your overall academic summary for Semester 4.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
           <div className="task-card" style={{ borderLeft: '4px solid #3b82f6', padding: '1.5rem' }}>
              <div className="task-icon bg-blue"><FontAwesomeIcon icon={faTrophy} /></div>
              <div className="task-details">
                 <h4 style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Current GPA</h4>
                 <p style={{ color: '#111827', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>3.85</p>
              </div>
           </div>
           
           <div className="task-card" style={{ borderLeft: '4px solid #10b981', padding: '1.5rem' }}>
              <div className="task-icon bg-green"><FontAwesomeIcon icon={faCalendarAlt} /></div>
              <div className="task-details">
                 <h4 style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Overall Attendance</h4>
                 <p style={{ color: '#111827', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>92%</p>
              </div>
           </div>

           <div className="task-card" style={{ borderLeft: '4px solid #ef4444', padding: '1.5rem' }}>
              <div className="task-icon bg-red"><FontAwesomeIcon icon={faTasks} /></div>
              <div className="task-details">
                 <h4 style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Pending Tasks</h4>
                 <p style={{ color: '#111827', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>3</p>
              </div>
           </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
           <h3 style={{ color: '#111827', marginBottom: '1.25rem', fontSize: '1.4rem' }}>My Enrolled Courses</h3>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {Object.values(COURSES_DATABASE).map((course: any) => (
                 <div key={course.id} className="tab-content-container" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', transition: 'transform 0.2s', cursor: 'pointer', border: '1px solid #d1d5db', borderRadius: '12px' }} onClick={() => navigate('/student/dashboard', { state: { courseId: course.id } })}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                       <div className="task-icon" style={{ background: course.bg, color: course.color, margin: 0 }}>
                          <FontAwesomeIcon icon={faChalkboardTeacher} />
                       </div>
                       <span className="status-badge" style={{ background: course.bg, color: course.color }}>{course.progress}% Completed</span>
                    </div>
                    <div>
                       <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', color: '#111827' }}>{course.title}</h4>
                       <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>{course.teacher}</p>
                    </div>
                    <div style={{ background: '#f3f4f6', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                       <div style={{ background: course.color, width: `${course.progress}%`, height: '100%' }}></div>
                    </div>
                    <button className="btn" style={{ background: '#f9fafb', color: '#0047ab', border: '1px solid #e5e7eb', width: '100%', justifyContent: 'center', marginTop: 'auto', fontWeight: '600' }}>
                       View Details <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '0.5rem' }} />
                    </button>
                 </div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  // --- 3. COURSE DETAILS VIEW (Assignments, Quizzes, etc.) ---
  return (
    <div className="student-course-page">
      <div className="student-hero-banner">
        <div className="hero-content">
           <h1 className="hero-title">{courseData.title}</h1>
           <p className="hero-subtitle">
             <FontAwesomeIcon icon={faChalkboardTeacher} style={{ marginRight: '8px' }} /> 
             Teacher: {courseData.teacher}
           </p>
        </div>
      </div>

      <div className="course-tabs">
        <button className={`course-tab ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab("assignments")}>
            <FontAwesomeIcon icon={faFileAlt} /> Assignments
        </button>
        <button className={`course-tab ${activeTab === 'quizzes' ? 'active' : ''}`} onClick={() => setActiveTab("quizzes")}>
            <FontAwesomeIcon icon={faClock} /> Quizzes
        </button>
        <button className={`course-tab ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab("attendance")}>
            <FontAwesomeIcon icon={faCalendarAlt} /> Attendance
        </button>
        <button className={`course-tab ${activeTab === 'grades' ? 'active' : ''}`} onClick={() => setActiveTab("grades")}>
            <FontAwesomeIcon icon={faChartBar} /> Grades
        </button>
      </div>

      <div className="tab-content-container">
        {activeTab === "assignments" && (
          <div>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#111827' }}>Pending Assignments</h3>
            {courseData.assignments.length === 0 ? <p style={{ color: '#6b7280' }}>No pending assignments.</p> : (
              <div className="task-grid">
                {courseData.assignments.map((task: any) => (
                  <div key={task.id} className="task-card">
                    <div className="task-icon bg-blue"><FontAwesomeIcon icon={faFileAlt} /></div>
                    <div className="task-details">
                        <h4>{task.title}</h4>
                        <p style={{ color: '#ef4444', fontWeight: '500' }}>Due: {task.due}</p>
                    </div>
                    <Link to="/student/submit-assignment" className="btn btn-primary btn-sm">Upload <FontAwesomeIcon icon={faUpload} /></Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "quizzes" && (
          <div>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#111827' }}>Course Quizzes</h3>
            <div className="task-grid">
              {courseData.quizzes.map((quiz: any) => (
                <div key={quiz.id} className={`task-card ${quiz.status === 'completed' ? 'completed' : ''}`}>
                   <div className={`task-icon ${quiz.status === 'completed' ? 'bg-green' : 'bg-purple'}`}><FontAwesomeIcon icon={quiz.status === 'completed' ? faCheckCircle : faClock} /></div>
                   <div className="task-details">
                      <h4>{quiz.title}</h4>
                      <p style={{ color: quiz.status === 'completed' ? '#10b981' : '#6b7280', fontWeight: '500' }}>{quiz.status === 'completed' ? `Score: ${quiz.marks}` : `Duration: ${quiz.duration}`}</p>
                   </div>
                   {quiz.status === 'completed' ? <button className="btn btn-sm" style={{ background: '#f3f4f6', color: '#9ca3af', border: 'none', cursor: 'not-allowed' }}>Completed</button> : <Link to="/student/attempt-quiz" className="btn btn-primary btn-sm">Attempt <FontAwesomeIcon icon={faPlayCircle} /></Link>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "attendance" && (
          <div>
             <h3 style={{ margin: '0 0 1.5rem 0', color: '#111827' }}>Attendance Record</h3>
             {courseData.attendance.length === 0 ? <p style={{ color: '#6b7280' }}>No attendance records found.</p> : (
                <div className="task-grid">
                   {courseData.attendance.map((att: any, index: number) => (
                      <div key={index} className="task-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div className={`task-icon ${att.status === 'Present' ? 'bg-green' : 'bg-red'}`} style={{ width: '45px', height: '45px', margin: 0 }}><FontAwesomeIcon icon={att.status === 'Present' ? faCheckCircle : faTimesCircle} /></div>
                            <div>
                               <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.1rem', color: '#111827' }}>{att.date}</h4>
                               <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>Daily Class Attendance</p>
                            </div>
                         </div>
                         <div><span className={`status-badge ${att.status === 'Present' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>{att.status}</span></div>
                      </div>
                   ))}
                </div>
             )}
          </div>
        )}

        {activeTab === "grades" && (
          <div>
             <h3 style={{ margin: '0 0 1.5rem 0', color: '#111827' }}>Grades & Remarks</h3>
             {courseData.grades.length === 0 ? <p style={{ color: '#6b7280' }}>No grades posted yet.</p> : (
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {courseData.grades.map((grade: any, index: number) => (
                       <div key={index} className="task-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem', gap: '1rem', borderTop: '4px solid #8b5cf6' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                             <span style={{ background: '#f5f3ff', color: '#8b5cf6', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>{grade.type}</span>
                             <span style={{ color: '#10b981', fontSize: '1.4rem', fontWeight: '900' }}>{grade.score}</span>
                          </div>
                          <div style={{ width: '100%' }}>
                             <h4 style={{ margin: '0 0 0.8rem 0', color: '#111827', fontSize: '1.15rem' }}>{grade.title}</h4>
                             <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #d1d5db', color: '#4b5563', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' }}>
                                <FontAwesomeIcon icon={faCommentDots} style={{ marginRight: '8px', color: '#9ca3af' }}/><span style={{ fontStyle: 'italic' }}>{grade.remarks || "No remarks provided."}</span>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
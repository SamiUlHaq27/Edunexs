import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChalkboardUser,
  faUserGraduate,
  faFileSignature,
  faCheckCircle,
  faPlus,
  faClipboardCheck,
  faBookOpen,
  faArrowRight,
  faCalendarAlt,
  faLayerGroup,
  faChartLine,
  faClock
} from "@fortawesome/free-solid-svg-icons";

// --- Styled Component: Modern Metric Card ---
const MetricCard = ({ title, value, subtext, icon, color }: any) => (
  <div style={{
    background: '#ffffff',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(149, 157, 165, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{title}</span>
      <div style={{ 
        width: '36px', height: '36px', borderRadius: '10px', 
        background: `${color}15`, color: color, 
        display: 'flex', alignItems: 'center', justifyContent: 'center' 
      }}>
        <FontAwesomeIcon icon={icon} />
      </div>
    </div>
    <div>
      <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>{value}</h3>
      <p style={{ fontSize: '0.813rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>{subtext}</p>
    </div>
  </div>
);

// --- Styled Component: Schedule Item ---
const ScheduleRow = ({ time, subject, room, status }: any) => (
  <div style={{ 
    display: 'flex', alignItems: 'center', padding: '1rem 0', 
    borderBottom: '1px solid #f1f5f9' 
  }}>
    <div style={{ width: '85px', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>{time}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.938rem' }}>{subject}</div>
      <div style={{ fontSize: '0.813rem', color: '#94a3b8' }}>{room}</div>
    </div>
    <div>
      {status === 'Live' ? (
        <span style={{ 
          background: '#ecfdf5', color: '#059669', padding: '4px 10px', 
          borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
          display: 'flex', alignItems: 'center', gap: '5px'
        }}>
          <span style={{ width: '6px', height: '6px', background: '#059669', borderRadius: '50%' }}></span> Live Now
        </span>
      ) : (
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>{status}</span>
      )}
    </div>
  </div>
);

export default function TeacherDashboard() {
  return (
    <div style={{ 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh', 
      padding: '2rem',
      fontFamily: "'Inter', sans-serif" 
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .hover-scale { transition: transform 0.2s ease; }
        .hover-scale:hover { transform: translateY(-2px); }
        .btn-modern { transition: all 0.2s ease; border: none; cursor: pointer; }
        .btn-modern:active { transform: scale(0.98); }
      `}</style>

      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>
            Teacher Dashboard
          </h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1rem' }}>
            Welcome back, <span style={{ color: '#0f172a', fontWeight: '600' }}></span>. Here is your summary for today.
          </p>
        </div>
      </div>
      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <MetricCard title="Active Courses" value="04" subtext="2 Lectures, 2 Labs" icon={faChalkboardUser} color="#3b82f6" />
        <MetricCard title="Total Students" value="142" subtext="+5 since last week" icon={faUserGraduate} color="#8b5cf6" />
        <MetricCard title="Pending Review" value="28" subtext="Assignments & Quizzes" icon={faFileSignature} color="#f59e0b" />
        <MetricCard title="Avg. Attendance" value="94.2%" subtext="Last 30 days" icon={faCheckCircle} color="#10b981" />
      </div>

      {/* Main Dashboard Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Schedule & Performance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 8px 24px rgba(149, 157, 165, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Teaching Schedule</h3>
              <span style={{ fontSize: '0.813rem', color: '#3b82f6', fontWeight: '600', cursor: 'pointer' }}>View Weekly</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <ScheduleRow time="09:00 AM" subject="Computer Science 101" room="Lab 03 • Sec A" status="Completed" />
              <ScheduleRow time="11:30 AM" subject="Advanced Mathematics" room="Room 402 • Sec B" status="Live" />
              <ScheduleRow time="02:00 PM" subject="Digital Logic Design" room="Room 105 • Sec C" status="Upcoming" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
             <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '20px', padding: '1.5rem', color: 'white' }}>
                <FontAwesomeIcon icon={faChartLine} style={{ fontSize: '1.5rem', marginBottom: '1rem', opacity: 0.8 }} />
                <h4 style={{ margin: 0, fontSize: '0.938rem', opacity: 0.9 }}>Class Performance</h4>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>+12.5%</div>
                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.8 }}>Higher than last semester</p>
             </div>
             <div style={{ background: '#0f172a', borderRadius: '20px', padding: '1.5rem', color: 'white' }}>
                <FontAwesomeIcon icon={faClock} style={{ fontSize: '1.5rem', marginBottom: '1rem', opacity: 0.8, color: '#f59e0b' }} />
                <h4 style={{ margin: 0, fontSize: '0.938rem', opacity: 0.9 }}>Next Deadline</h4>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '0.5rem' }}>Today, 11:59 PM</div>
                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.8 }}>Mid-term Result Upload</p>
             </div>
          </div>
        </div>

        {/* Right Column: Progress & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 8px 24px rgba(149, 157, 165, 0.05)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Course Progress</h3>
            
            {[
              { label: 'Programming Fundamentals', p: 85, c: '#3b82f6' },
              { label: 'Discrete Structures', p: 42, c: '#f59e0b' },
              { label: 'Data Science Lab', p: 92, c: '#10b981' }
            ].map((item, idx) => (
              <div key={idx} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.813rem', fontWeight: '600', color: '#475569' }}>{item.label}</span>
                  <span style={{ fontSize: '0.813rem', fontWeight: '700', color: item.c }}>{item.p}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px' }}>
                  <div style={{ width: `${item.p}%`, height: '100%', background: item.c, borderRadius: '10px' }}></div>
                </div>
              </div>
            ))}
            
            <button style={{ 
              width: '100%', border: 'none', background: '#f8fafc', padding: '12px', 
              borderRadius: '12px', color: '#64748b', fontWeight: '600', 
              fontSize: '0.875rem', cursor: 'pointer', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', gap: '8px' 
            }}>
              View Full Syllabus <FontAwesomeIcon icon={faArrowRight} size="sm" />
            </button>
          </div>

          <div style={{ 
            background: '#ffffff', borderRadius: '20px', padding: '1.5rem', 
            border: '2px dashed #e2e8f0', display: 'flex', flexDirection: 'column', 
            alignItems: 'center', textAlign: 'center', gap: '1rem' 
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <FontAwesomeIcon icon={faLayerGroup} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.938rem', color: '#0f172a' }}>Resources Center</h4>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.813rem', color: '#94a3b8' }}>Upload notes for your students</p>
            </div>
            <button className="btn-modern" style={{ background: '#f1f5f9', color: '#0f172a', padding: '8px 16px', borderRadius: '10px', fontSize: '0.813rem', fontWeight: '700' }}>
              Quick Upload
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
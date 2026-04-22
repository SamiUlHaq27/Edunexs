import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, faTrash, faArrowLeft, faSave, 
  faClock, faEye, faUserGraduate, faCalendarAlt, 
  faCheckCircle, faChartLine 
} from "@fortawesome/free-solid-svg-icons";

export default function TeacherQuizzes() {
  const [view, setView] = useState<"list" | "create" | "submissions">("list");
  const [questions, setQuestions] = useState([{ id: 1, text: "", options: ["", "", "", ""], correct: 0 }]);

  // Mock Data 
  const studentResults = [
    { id: 1, name: "Ali Hashmi", rollNo: "BCS-786", marks: 9, total: 10, date: "30 Mar 2026", avatar: "https://i.pravatar.cc/150?img=11" },
    { id: 2, name: "Zain Ahmed", rollNo: "BCS-787", marks: 7, total: 10, date: "30 Mar 2026", avatar: "https://i.pravatar.cc/150?img=12" },
    { id: 3, name: "Sara Khan", rollNo: "BCS-790", marks: 4, total: 10, date: "30 Mar 2026", avatar: "https://i.pravatar.cc/150?img=5" }
  ];

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), text: "", options: ["", "", "", ""], correct: 0 }]);
  };

  // Helper function for performance color
  const getScoreColor = (marks: number, total: number) => {
    const percentage = (marks / total) * 100;
    if (percentage >= 80) return { color: '#10b981', bg: '#d1fae5', label: 'Excellent' };
    if (percentage >= 50) return { color: '#f59e0b', bg: '#fef3c7', label: 'Average' };
    return { color: '#ef4444', bg: '#fee2e2', label: 'Needs Improvement' };
  };

  // --- VIEW 1: QUIZ CREATOR ---
  if (view === "create") {
    return (
      <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
        <button className="btn" onClick={() => setView("list")} style={{ marginBottom: '1.5rem', background: '#f3f4f6' }}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Quizzes
        </button>
        <div className="card" style={{ padding: '2rem', borderLeft: '5px solid #0066ff' }}>
            <h3 className="card-title" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Create MCQ Quiz</h3>
            <div style={{ margin: '1.5rem 0' }}>
            <label className="auth-label">Quiz Title</label>
            <input className="auth-input" placeholder="e.g. Physics Mid-Term Assessment" />
            </div>

            {questions.map((q, qIndex) => (
            <div key={q.id} className="question-block" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: '#1e293b' }}>Question {qIndex + 1}</h4>
                <button className="btn" style={{ color: '#ef4444', background: 'none' }} onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))}>
                    <FontAwesomeIcon icon={faTrash} />
                </button>
                </div>
                <input 
                className="auth-input" 
                placeholder="Enter your question text..." 
                value={q.text} 
                onChange={e => { const n = [...questions]; n[qIndex].text = e.target.value; setQuestions(n); }} 
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                {q.options.map((opt, oIndex) => (
                    <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <input type="radio" name={`correct-${q.id}`} checked={q.correct === oIndex} onChange={() => { const n = [...questions]; n[qIndex].correct = oIndex; setQuestions(n); }} />
                    <input className="auth-input" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={e => {
                        const newQ = [...questions];
                        newQ[qIndex].options[oIndex] = e.target.value;
                        setQuestions(newQ);
                    }} style={{ border: 'none', padding: '5px', marginBottom: 0 }} />
                    </div>
                ))}
                </div>
            </div>
            ))}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn" style={{ border: '1px solid #d1d5db' }} onClick={addQuestion}><FontAwesomeIcon icon={faPlus} /> Add Question</button>
            <button className="btn btn-primary" onClick={() => { alert("Quiz Saved!"); setView("list"); }}><FontAwesomeIcon icon={faSave} /> Publish Quiz</button>
            </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: MODERN SUBMISSIONS VIEW (Requirement: Screenshot Upgrade) ---
  if (view === "submissions") {
    return (
      <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <button className="btn" onClick={() => setView("list")} style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
                <FontAwesomeIcon icon={faArrowLeft} /> Back
            </button>
            <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0, fontWeight: '800', color: '#0f172a' }}>General Knowledge Quiz</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Student Results Overview</p>
            </div>
        </div>

        {/* Results Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {studentResults.map(res => {
            const status = getScoreColor(res.marks, res.total);
            return (
              <div key={res.id} className="card" style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                padding: '1.25rem', borderRadius: '16px', transition: 'transform 0.2s',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <img src={res.avatar} alt="pfp" style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>{res.name}</h4>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                        <span><FontAwesomeIcon icon={faUserGraduate} style={{marginRight: '5px'}}/> {res.rollNo}</span>
                        <span><FontAwesomeIcon icon={faCalendarAlt} style={{marginRight: '5px'}}/> {res.date}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: status.color }}>
                            {res.marks}<span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>/{res.total}</span>
                        </div>
                        <div style={{ 
                            fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', 
                            padding: '2px 8px', borderRadius: '6px', background: status.bg, color: status.color 
                        }}>
                            {status.label}
                        </div>
                    </div>
                    <button className="btn" style={{ background: '#f8fafc', color: '#6366f1', padding: '10px' }}>
                        <FontAwesomeIcon icon={faEye} />
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- VIEW 3: LIST VIEW ---
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Available Quizzes</h2>
        <button className="btn btn-primary" onClick={() => setView("create")}>
          <FontAwesomeIcon icon={faPlus} /> Create New Quiz
        </button>
      </div>
      
      <div className="activity-list">
         <div className="card" style={{ 
           display: 'flex', alignItems: 'center', padding: '1.5rem', 
           borderRadius: '16px', background: 'white', border: '1px solid #f1f5f9' 
         }}>
            <div style={{ 
              width: '50px', height: '50px', borderRadius: '12px', background: '#eef2ff', 
              color: '#6366f1', display: 'grid', placeItems: 'center', fontSize: '1.5rem', marginRight: '1.25rem' 
            }}>
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            <div style={{ flex: 1 }}>
               <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#1e293b' }}>General Knowledge Quiz</div>
               <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '3px' }}>
                 <FontAwesomeIcon icon={faClock} style={{marginRight: '5px'}}/> 10 Questions • Published on 30 Mar
               </div>
            </div>
            <button className="btn btn-primary" onClick={() => setView("submissions")} style={{ borderRadius: '10px', padding: '0.6rem 1.25rem' }}>
              <FontAwesomeIcon icon={faEye} /> View Submissions
            </button>
         </div>
      </div>
    </div>
  );
}
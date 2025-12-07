import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faArrowLeft, faSave } from "@fortawesome/free-solid-svg-icons";

export default function TeacherQuizzes() {
  const [view, setView] = useState<"list" | "create">("list");
  const [questions, setQuestions] = useState([{ id: 1, text: "", options: ["", "", "", ""], correct: 0 }]);

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), text: "", options: ["", "", "", ""], correct: 0 }]);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, val: string) => {
    const newQ = [...questions];
    newQ[qIndex].options[oIndex] = val;
    setQuestions(newQ);
  };

  if (view === "create") {
    return (
      <div className="card settings-container">
        <button className="btn" onClick={() => setView("list")} style={{ marginBottom: '1rem' }}><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
        <h3 className="card-title">Create Quiz (MCQs)</h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <label className="auth-label">Quiz Title</label>
          <input className="auth-input" placeholder="e.g. Physics Mid-Term" />
        </div>

        {questions.map((q, qIndex) => (
          <div key={q.id} style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
               <label className="auth-label">Question {qIndex + 1}</label>
               <button className="btn btn-delete" onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))}><FontAwesomeIcon icon={faTrash} /></button>
            </div>
            <input 
              className="auth-input" 
              placeholder="Enter question text..." 
              value={q.text} 
              onChange={e => { const n = [...questions]; n[qIndex].text = e.target.value; setQuestions(n); }} 
            />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="input-with-icon" style={{ margin: 0 }}>
                  <span className="input-icon">
                    <input 
                      type="radio" 
                      name={`correct-${q.id}`} 
                      checked={q.correct === oIndex} 
                      onChange={() => { const n = [...questions]; n[qIndex].correct = oIndex; setQuestions(n); }}
                    />
                  </span>
                  <input 
                    className="auth-input" 
                    placeholder={`Option ${oIndex + 1}`} 
                    value={opt}
                    onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
           <button type="button" className="btn" onClick={addQuestion}><FontAwesomeIcon icon={faPlus} /> Add Question</button>
           <button className="btn btn-primary"><FontAwesomeIcon icon={faSave} /> Save Quiz</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="toolbar">
        <h3>Quizzes</h3>
        <button className="btn btn-primary" onClick={() => setView("create")}><FontAwesomeIcon icon={faPlus} /> Create Quiz</button>
      </div>
      <div className="table-container">
         <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No quizzes created yet.</p>
      </div>
    </div>
  );
}
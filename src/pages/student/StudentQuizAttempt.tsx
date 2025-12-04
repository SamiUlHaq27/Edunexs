import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faArrowRight, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function StudentQuizAttempt() {
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  
  // Mock Quiz
  const questions = [
    { id: 1, text: "What is the value of Pi?", options: ["3.14", "2.14", "3.41", "4.13"] },
    { id: 2, text: "What is the capital of Pakistan?", options: ["Lahore", "Karachi", "Islamabad", "Quetta"] },
    { id: 3, text: "Speed of light is?", options: ["3x10^8 m/s", "300 km/h", "Sound speed", "Infinite"] },
  ];

  const handleSelect = (idx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Submit logic
      alert("Quiz Submitted! Score calculation would happen here.");
      navigate("/student/courses");
    }
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
         <h3 className="card-title" style={{ margin: 0 }}>General Knowledge Quiz</h3>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 'bold' }}>
            <FontAwesomeIcon icon={faClock} /> 12:45
         </div>
      </div>

      <div className="quiz-progress">
         <div className="quiz-progress-bar" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
      </div>

      <div className="question-block" style={{ background: '#fff', border: 'none', padding: 0 }}>
         <h4 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
           Q{currentQ + 1}: {questions[currentQ].text}
         </h4>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {questions[currentQ].options.map((opt, idx) => (
              <div 
                key={idx} 
                className={`quiz-option ${answers[currentQ] === idx ? 'selected' : ''}`}
                onClick={() => handleSelect(idx)}
              >
                <div style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #ccc',
                  marginRight: '1rem', display: 'grid', placeItems: 'center',
                  background: answers[currentQ] === idx ? 'var(--color-primary-500)' : 'transparent',
                  borderColor: answers[currentQ] === idx ? 'var(--color-primary-500)' : '#ccc'
                }}>
                  {answers[currentQ] === idx && <div style={{ width: '10px', height: '10px', background: '#fff', borderRadius: '50%' }}></div>}
                </div>
                {opt}
              </div>
            ))}
         </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
         <button className="btn btn-primary" onClick={handleNext}>
            {currentQ === questions.length - 1 ? 'Submit Quiz' : 'Next Question'} <FontAwesomeIcon icon={faArrowRight} />
         </button>
      </div>
    </div>
  );
}
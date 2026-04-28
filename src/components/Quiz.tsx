import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RefreshCw, Award } from 'lucide-react';
import { generateQuiz } from '../services/gemini';
import { saveQuizScore, earnBadge } from '../services/userService';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface QuizProps {
  topic?: string;
  onClose?: () => void;
}

const Quiz: React.FC<QuizProps> = ({ topic = "Elections", onClose }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    loadQuiz();
  }, [topic]);

  const loadQuiz = async () => {
    setLoading(true);
    const data = await generateQuiz(topic);
    setQuestions(data);
    setLoading(false);
    setCurrentStep(0);
    setScore(0);
    setShowResult(false);
  };

  const handleOptionClick = (option: string) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(option);
    const correct = option === questions[currentStep].answer;
    setIsCorrect(correct);
    if (correct) setScore(prev => prev + 1);

    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        const finalScore = score + (correct ? 1 : 0);
        saveQuizScore(finalScore);
        if (finalScore === questions.length) earnBadge('quiz_master');
        setShowResult(true);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="quiz-container flex-center">
        <div className="aura-spinner"></div>
        <p style={{ marginTop: '1rem' }}>Generating your personalized quiz...</p>
      </div>
    );
  }

  if (showResult) {
    return (
      <motion.div 
        className="quiz-result glass-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Award size={64} className="text-gradient" style={{ marginBottom: '1.5rem' }} />
        <h2>Quiz Complete!</h2>
        <div className="score-badge">
          {score} / {questions.length}
        </div>
        <p>{score === questions.length ? "Perfect! You're a true Civic Expert!" : "Great effort! Keep learning."}</p>
        <div className="quiz-actions">
          <button className="learn-more-btn" onClick={loadQuiz}>
            <RefreshCw size={18} /> Try Another
          </button>
          {onClose && (
            <button className="learn-more-btn" onClick={onClose} style={{ marginTop: '0.5rem', background: 'transparent' }}>
              Close
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentStep];

  return (
    <div className="quiz-content">
      <div className="quiz-header">
        <span className="quiz-progress">Question {currentStep + 1} of {questions.length}</span>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}></div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="question-section"
        >
          <h3 className="quiz-question">{currentQuestion.question}</h3>
          <div className="options-grid">
            {currentQuestion.options.map((option, idx) => {
              let className = "option-card glass-card";
              if (selectedOption === option) {
                className += isCorrect ? " correct" : " incorrect";
              } else if (selectedOption !== null && option === currentQuestion.answer) {
                className += " correct-highlight";
              }

              return (
                <button 
                  key={idx} 
                  className={className}
                  onClick={() => handleOptionClick(option)}
                  disabled={selectedOption !== null}
                >
                  <span className="option-text">{option}</span>
                  {selectedOption === option && (
                    isCorrect ? <CheckCircle size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Quiz;

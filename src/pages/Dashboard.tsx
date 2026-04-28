import React, { useState, useEffect } from 'react';
import 'chart.js/auto';
import { Doughnut, Line } from 'react-chartjs-2';
import { TrendingUp, BookOpen, Clock, Target, PlayCircle } from 'lucide-react';
import Quiz from '../components/Quiz';
import VotingLocation from '../components/VotingLocation';
import { getUserProgress, type UserProgress } from '../services/userService';

const Dashboard: React.FC = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    getUserProgress().then(setProgress);
  }, []);

  const progressData = {
    labels: ['Completed', 'In Progress', 'Locked'],
    datasets: [
      {
        data: [65, 20, 15],
        backgroundColor: ['#6366f1', '#a855f7', '#1e1b4b'],
        borderWidth: 0,
      },
    ],
  };

  const activityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Learning Minutes',
        data: [30, 45, 20, 60, 40, 80, 50],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="dashboard-view">
      <h2 className="view-title">Welcome back, <span className="text-gradient">Voter!</span></h2>

      <div className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-header">
            <BookOpen className="stat-icon" />
            <span>Modules Done</span>
          </div>
          <div className="stat-value">{progress?.completedModules.length || 0} / 20</div>
          <div className="stat-footer text-green">+{progress?.completedModules.length || 0} total</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-header">
            <Clock className="stat-icon" />
            <span>Learning Points</span>
          </div>
          <div className="stat-value">{progress?.totalPoints || 0}</div>
          <div className="stat-footer">XP Gained</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-header">
            <Target className="stat-icon" />
            <span>Avg Quiz Score</span>
          </div>
          <div className="stat-value">
            {progress?.quizScores.length
              ? Math.round((progress.quizScores.reduce((a, b) => a + b, 0) / (progress.quizScores.length * 3)) * 100)
              : 0}%
          </div>
          <div className="stat-footer text-purple">{progress?.quizScores.length || 0} Quizzes taken</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-header">
            <TrendingUp className="stat-icon" />
            <span>Rank</span>
          </div>
          <div className="stat-value">{(progress?.totalPoints || 0) > 100 ? "Civic Pro" : "Beginner"}</div>
          <div className="stat-footer">{progress?.badges.length || 0} Badges earned</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card glass-card main-chart">
          <h3>Weekly Learning Activity</h3>
          <div className="chart-wrapper">
            <Line data={activityData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>

        <div className="side-column">
          <VotingLocation />
          <div className="chart-card glass-card side-chart">
            <h3>Journey Progress</h3>
            <div className="chart-wrapper doughnut">
              <Doughnut data={progressData} options={{ cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} />
            </div>
          </div>
        </div>
      </div>

      <div className="badges-section">
        <h3>Achievements & <span className="text-gradient">Badges</span></h3>
        <div className="badges-grid">
          <div className={`badge-card glass-card ${progress?.completedModules.length ? 'earned' : ''}`}>
            <div className="badge-icon">🗳️</div>
            <span>Smart Voter</span>
          </div>
          <div className={`badge-card glass-card ${progress?.streak ? 'earned' : ''}`}>
            <div className="badge-icon">🔥</div>
            <span>Streak</span>
          </div>
          <div className={`badge-card glass-card ${progress?.badges.includes('quiz_master') ? 'earned' : ''}`}>
            <div className="badge-icon">🧠</div>
            <span>Quiz Master</span>
          </div>
          <div className={`badge-card glass-card ${progress?.totalPoints && progress.totalPoints > 500 ? 'earned' : ''}`}>
            <div className="badge-icon">🏛️</div>
            <span>Civic Leader</span>
          </div>
        </div>
      </div>

      <div className="quiz-section-dashboard glass-card">
        {showQuiz ? (
          <Quiz topic="Elections and Voting" onClose={() => setShowQuiz(false)} />
        ) : (
          <div className="quiz-promo">
            <div className="promo-text">
              <h3>Ready for a challenge?</h3>
              <p>Test your knowledge with an AI-generated quiz based on your recent learning.</p>
            </div>
            <button className="aura-send-btn" onClick={() => setShowQuiz(true)} style={{ width: 'auto', borderRadius: '1rem', padding: '0 2rem' }}>
              <PlayCircle size={20} style={{ marginRight: '0.5rem' }} />
              Start Quiz
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .dashboard-view {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-bottom: 4rem;
        }

        .view-title {
          font-size: 2rem;
          font-weight: 700;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .stat-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-dim);
          font-size: 0.9rem;
        }

        .stat-icon {
          color: var(--primary);
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
        }

        .stat-footer {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }

        .side-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .chart-card {
          padding: 2rem;
          height: 350px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .chart-wrapper {
          flex: 1;
          position: relative;
        }

        .doughnut {
          max-height: 200px;
        }

        .quiz-section-dashboard {
          padding: 2rem;
        }

        .quiz-promo {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .promo-text h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .promo-text p {
          color: var(--text-dim);
        }

        .badges-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .badges-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .badge-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          opacity: 0.5;
          grayscale: 1;
        }

        .badge-card.earned {
          opacity: 1;
          grayscale: 0;
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.05);
        }

        .badge-icon {
          font-size: 2.5rem;
        }

        .badge-card span {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .text-green { color: #10b981; }
        .text-purple { color: #a855f7; }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .charts-grid {
            grid-template-columns: 1fr;
          }

          .quiz-promo {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .view-title {
            font-size: 1.5rem;
          }
        }
      ` }} />
    </div>
  );
};

export default Dashboard;

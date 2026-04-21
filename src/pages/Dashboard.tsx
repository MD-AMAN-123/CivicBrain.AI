import React from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { Doughnut, Line } from 'react-chartjs-2';
import { TrendingUp, BookOpen, Clock, Target } from 'lucide-react';

const Dashboard: React.FC = () => {
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
          <div className="stat-value">12 / 20</div>
          <div className="stat-footer text-green">+2 this week</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-header">
            <Clock className="stat-icon" />
            <span>Time Spent</span>
          </div>
          <div className="stat-value">4.5 hrs</div>
          <div className="stat-footer">Daily avg: 45m</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-header">
            <Target className="stat-icon" />
            <span>Quiz Score</span>
          </div>
          <div className="stat-value">88%</div>
          <div className="stat-footer text-purple">Top 10% this week</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-header">
            <TrendingUp className="stat-icon" />
            <span>Rank</span>
          </div>
          <div className="stat-value">Civic Pro</div>
          <div className="stat-footer">500 pts to Master</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card glass-card main-chart">
          <h3>Weekly Learning Activity</h3>
          <div className="chart-wrapper">
            <Line data={activityData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="chart-card glass-card side-chart">
          <h3>Journey Progress</h3>
          <div className="chart-wrapper doughnut">
            <Doughnut data={progressData} options={{ cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .dashboard-view {
          display: flex;
          flex-direction: column;
          gap: 2rem;
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

        .chart-card {
          padding: 2rem;
          height: 400px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .chart-wrapper {
          flex: 1;
          position: relative;
        }

        .doughnut {
          max-height: 250px;
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

          .chart-card {
            height: 350px;
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

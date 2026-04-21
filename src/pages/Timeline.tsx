import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ClipboardList, Megaphone, Vote, BarChart3, CheckCircle2 } from 'lucide-react';

const timelineSteps = [
  {
    title: 'Voter Registration',
    icon: <UserPlus />,
    description: 'The foundation of democracy. Register to vote and ensure your voice is counted.',
    details: ['Eligibility check', 'Form submission', 'Verification process'],
    color: '#3b82f6'
  },
  {
    title: 'Candidate Nomination',
    icon: <ClipboardList />,
    description: 'Learn how candidates qualify and file their nominations to contest.',
    details: ['Filing papers', 'Asset disclosure', 'Scrutiny of papers'],
    color: '#a855f7'
  },
  {
    title: 'Campaign Period',
    icon: <Megaphone />,
    description: 'Candidates share their vision and manifestos with the public.',
    details: ['Rallies and meetings', 'Manifesto analysis', 'Code of conduct'],
    color: '#f59e0b'
  },
  {
    title: 'The Voting Day',
    icon: <Vote />,
    description: 'Exercise your right! A step-by-step walk through the polling station.',
    details: ['ID verification', 'EVM/Paper ballot', 'The ink mark'],
    color: '#ef4444'
  },
  {
    title: 'Counting & Verification',
    icon: <BarChart3 />,
    description: 'How every single vote is securely counted and verified.',
    details: ['Strong room security', 'VVPAT matching', 'Agent verification'],
    color: '#10b981'
  },
  {
    title: 'Results & Declaration',
    icon: <CheckCircle2 />,
    description: 'The final outcome and the formation of the government.',
    details: ['Majority calculation', 'Official gazette', 'Victory certification'],
    color: '#6366f1'
  }
];

const Timeline: React.FC = () => {
  return (
    <div className="timeline-view">
      <div className="timeline-header">
        <h2 className="view-title">The Election <span className="text-gradient">Journey</span></h2>
        <p className="view-subtitle">Understand the democratic process from start to finish.</p>
      </div>

      <div className="timeline-container">
        {timelineSteps.map((step, index) => (
          <motion.div 
            key={index}
            className="timeline-item"
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="timeline-dot-wrapper">
              <div className="timeline-dot" style={{ backgroundColor: step.color }}>
                {step.icon}
              </div>
              {index !== timelineSteps.length - 1 && <div className="timeline-line"></div>}
            </div>
            
            <div className="timeline-content glass-card">
              <div className="content-badge" style={{ backgroundColor: `${step.color}22`, color: step.color }}>
                Step {index + 1}
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <ul className="step-details">
                {step.details.map((detail, idx) => (
                  <li key={idx}>
                    <div className="detail-bullet" style={{ backgroundColor: step.color }}></div>
                    {detail}
                  </li>
                ))}
              </ul>
              <button className="learn-more-btn" style={{ borderColor: `${step.color}44`, color: step.color }}>
                Deep Dive Explainer
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .timeline-view {
          display: flex;
          flex-direction: column;
          gap: 3rem;
          padding-bottom: 5rem;
        }

        .timeline-header {
          text-align: center;
        }

        .view-subtitle {
          color: var(--text-dim);
          margin-top: 0.5rem;
        }

        .timeline-container {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .timeline-item {
          display: flex;
          gap: 3rem;
          align-items: flex-start;
        }

        .timeline-dot-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 1rem;
        }

        .timeline-dot {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 2;
          box-shadow: 0 0 20px rgba(0,0,0,0.3);
        }

        .timeline-line {
          width: 2px;
          flex: 1;
          background: var(--glass-border);
          margin-top: 0.5rem;
          min-height: 100px;
        }

        .timeline-content {
          flex: 1;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .content-badge {
          align-self: flex-start;
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .timeline-content h3 {
          font-size: 1.75rem;
          font-weight: 700;
        }

        .timeline-content p {
          color: var(--text-dim);
          line-height: 1.6;
        }

        .step-details {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .step-details li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: #e2e8f0;
        }

        .detail-bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .learn-more-btn {
          margin-top: 0.5rem;
          padding: 0.6rem 1.2rem;
          background: transparent;
          border: 1px solid;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          align-self: flex-start;
        }

        .learn-more-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(5px);
        }

        @media (max-width: 768px) {
          .timeline-item {
            gap: 1.5rem;
          }
          .timeline-dot {
            width: 40px;
            height: 40px;
          }
          .timeline-content {
            padding: 1.5rem;
          }
          .timeline-content h3 {
            font-size: 1.25rem;
          }
          .step-details {
            grid-template-columns: 1fr;
          }
        }
      ` }} />
    </div>
  );
};

export default Timeline;

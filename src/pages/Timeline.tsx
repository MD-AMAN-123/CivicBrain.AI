import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ClipboardList, Megaphone, Vote, BarChart3, CheckCircle2 } from 'lucide-react';
import { updateModuleCompletion } from '../services/userService';

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
  const navigate = useNavigate();

  return (
    <div className="timeline-view">
      <div className="timeline-header">
        <h2 className="view-title">The Election <span className="text-gradient">Journey</span></h2>
        <p className="view-subtitle">Scroll through the democratic process from start to finish.</p>
      </div>

      <div className="timeline-container">
        {timelineSteps.map((step, index) => (
          <motion.div 
            key={index}
            className="timeline-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            style={{ '--step-color': step.color } as React.CSSProperties}
          >
            <div className="timeline-dot-wrapper">
              <div className="timeline-dot">
                {step.icon}
              </div>
              {index !== timelineSteps.length - 1 && <div className="timeline-line"></div>}
            </div>
            
            <div className="timeline-content glass-card">
              <div className="content-badge">
                Step {index + 1}
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <ul className="step-details">
                {step.details.map((detail, idx) => (
                   <li key={idx}>
                    <div className="detail-bullet"></div>
                    {detail}
                  </li>
                ))}
              </ul>
              <button 
                className="learn-more-btn" 
                onClick={() => {
                  updateModuleCompletion(step.title);
                  navigate('/assistant', { state: { prompt: `Deep dive into ${step.title}: ${step.description}` } });
                }}
              >
                Deep Dive Explainer
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;

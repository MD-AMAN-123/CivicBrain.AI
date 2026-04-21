export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';

interface ExplainParams {
  topic: string;
  level: LearningLevel;
  language?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

/**
 * Service to interact with Gemini AI (via Cloud Functions in production)
 */
export const explainConcept = async (_params: ExplainParams): Promise<string> => {
  const { level } = _params;

  const mockResponses: Record<LearningLevel, string> = {
    beginner: `Imagine an election is like choosing a class leader. A 'Voter' is anyone who gets to pick. 'Registration' is just putting your name on the list so everyone knows you're part of the class!`,
    intermediate: `Election systems are complex frameworks that translate individual preferences into collective decisions. Voter registration ensures the integrity of the 'one person, one vote' principle by maintaining accurate electoral rolls.`,
    advanced: `The electoral architecture involves multi-stage verification protocols. Voter registration serves as a cryptographic entry point, often utilizing biometric or federated identity systems to mitigate Sybil attacks and ensure distributive justice in representative outcomes.`
  };

  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve(mockResponses[level] || mockResponses.beginner);
    }, 1500);
  });
};

export const generateQuiz = async (_progress: Record<string, unknown>): Promise<QuizQuestion[]> => {
  return [
    {
      question: "What is the first step in the election journey?",
      options: ["Campaigning", "Voting", "Registration", "Nomination"],
      answer: "Registration"
    }
  ];
};

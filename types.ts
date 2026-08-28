
export interface CalculationHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface SolverHistoryItem {
  id: string;
  problem: string;
  problemStatement?: string;
  method?: string;
  steps?: string[];
  answer: string;
  explanation: string;
  timestamp: number;
  isStarred?: boolean;
}

export interface SolverResult {
  problemStatement?: string;
  method?: string;
  steps: string[];
  answer: string;
  explanation: string;
}

export type ViewState = 'launchpad' | 'workspace' | 'settings' | 'notes' | 'chat' | 'formulas';

export interface AiExplanation {
  explanation: string;
  steps: string[];
}

export interface AppSettings {
  historyEnabled: boolean;
  retentionPeriod: '1week' | '1month' | '3months' | 'forever';
  theme: 'dark' | 'glass';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStarred?: boolean;
}

export interface Formula {
  id: string;
  name: string;
  expression: string;
  category: string;
  description: string;
}


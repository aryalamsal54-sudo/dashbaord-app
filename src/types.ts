export interface Question {
  n: string;
  t: string;
  a?: string;
  type?: string;
}

export interface Topic {
  id: string;
  title: string;
  derivations?: Question[];
  questions?: Question[];
}

export interface Solution {
  solution: string | null;
  explanation?: string | null;
  voiceExplanation?: string | null;
  modelUsed?: string;
  cached?: boolean;
  source?: string;
}

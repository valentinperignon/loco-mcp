export interface Locale {
  code: string;
  name: string;
  source?: boolean;
  plurals: {
    length: number;
    equation: string;
    forms: string[];
  };
  progress: {
    translated: number;
    untranslated: number;
    flagged: number;
    words?: number;
  }
}

export interface Asset {
  id: string;
  type: string;
  context?: string;
  notes?: string;
  printf?: string;
  created: string;
  modified: string;
  plurals: number;
  tags: string[];
  aliases: Record<string, string>;
  progress: {
    translated: number;
    untranslated: number;
    flagged: number;
  };
}

export interface Translation {
  id: string;
  translation: string;
  translated: boolean;
  status: string;
  revision: number;
  flagged: boolean;
  modified: string;
  author?: {
    id: number;
    name: string;
    email: string;
  };
  locale: {
    code: string;
    name: string;
  };
  plurals?: string[];
}

export interface SuccessResponse {
  status: number;
  message: string;
}

// Application settings, error, and validation types

import type { OptionType } from './loggerTypes';

export interface AppSettings {
  defaultPomodoroDuration?: number;
  defaultBreakDuration?: number;
  autoStartBreaks?: boolean;
  notifications?: boolean;
  theme?: 'light' | 'dark' | 'system';
  dateFormat?: string;
}

export interface AppError {
  message: string;
  code?: string;
  timestamp: number;
}

export interface TimerState {
  isRunning: boolean;
  elapsedTime: number;
  activeProject: OptionType | null;
}

export interface FormValidation {
  isValid: boolean;
  errors: string[];
}

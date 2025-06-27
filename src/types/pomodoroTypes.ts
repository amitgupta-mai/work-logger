// Pomodoro and break-related types

export interface PomodoroState {
  isRunning: boolean;
  remainingTime: number;
  startTime: number | null;
  duration: number;
}

export interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  longBreakInterval: number;
  ttsEnabled?: boolean;
}

export interface BreakSettings {
  enabled: boolean;
  interval: number;
  reminderType: 'notification' | 'popup' | 'both';
  breakActivities: string[];
  customMessage: string;
  lastBreakTime: number;
  nextBreakTime: number;
  ttsEnabled?: boolean;
}

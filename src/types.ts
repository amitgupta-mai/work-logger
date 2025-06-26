// OptionType for dropdown selections (like meetings, tasks, projects, etc.)
export type OptionType = {
  label: string;
  value: string;
};

// DurationType for selecting time durations
export type DurationType = {
  value: number;
  label: string;
};

// LogType for handling log type selection (Meeting or Task)
export type LogType = 'Meeting' | 'Task';

// EntryType for handling entries
export type EntryType = {
  id: string;
  entry: string;
  date: string;
  timestamp?: number;
  type?: LogType;
  project?: string;
  duration?: number;
  person?: string;
};

// Chrome Storage Types
export interface ChromeStorageData {
  allEntries?: Record<string, EntryType[]>;
  people?: OptionType[];
  projects?: OptionType[];
  isRunning?: boolean;
  isPomodoroRunning?: boolean;
  pomodoroStartTime?: number;
  pomodoroDuration?: number;
  elapsedTime?: number;
  activeProject?: OptionType;
  settings?: AppSettings;
  pomodoroSettings?: PomodoroSettings;
  isBreak?: boolean;
  completedPomodoros?: number;
  breakSettings?: BreakSettings;
}

// Application Settings
export interface AppSettings {
  defaultPomodoroDuration?: number;
  defaultBreakDuration?: number;
  autoStartBreaks?: boolean;
  notifications?: boolean;
  theme?: 'light' | 'dark' | 'system';
  dateFormat?: string;
}

// Error Types
export interface AppError {
  message: string;
  code?: string;
  timestamp: number;
}

// Timer State
export interface TimerState {
  isRunning: boolean;
  elapsedTime: number;
  activeProject: OptionType | null;
}

// Pomodoro State
export interface PomodoroState {
  isRunning: boolean;
  remainingTime: number;
  startTime: number | null;
  duration: number;
}

// Form Validation
export interface FormValidation {
  isValid: boolean;
  errors: string[];
}

// API Response Types
export interface StorageResponse {
  success: boolean;
  data?: ChromeStorageData;
  error?: string;
}

// Pomodoro Settings
export interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  longBreakInterval: number;
  ttsEnabled?: boolean;
}

// Break Settings
export interface BreakSettings {
  enabled: boolean;
  interval: number;
  reminderType: 'notification' | 'popup' | 'both';
  breakActivities: string[];
  customMessage: string;
  lastBreakTime: number;
  nextBreakTime: number;
}

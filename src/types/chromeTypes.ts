// Chrome Storage and API response types

import type { EntryType, OptionType } from './loggerTypes';
import type { AppSettings } from './appTypes';
import type { PomodoroSettings, BreakSettings } from './pomodoroTypes';

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

export interface StorageResponse {
  success: boolean;
  data?: ChromeStorageData;
  error?: string;
}

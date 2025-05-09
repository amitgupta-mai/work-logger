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
};

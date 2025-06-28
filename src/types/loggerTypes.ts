// Logger-related types

export type OptionType = {
  label: string;
  value: string;
};

export interface DurationOption {
  value: number;
  label: string;
}

export interface Duration {
  value: number;
  label: string;
}

export type LogType = 'Meeting' | 'Task';

export type EntryType = {
  id: string;
  entry: string;
  date: string;
  timestamp?: number;
  type?: LogType;
  project?: string;
  duration?: number;
  person?: string;
  startTime?: string;
  endTime?: string;
};

export interface TaskFormProps {
  selectedProject: OptionType | null;
  setSelectedProject: (project: OptionType | null) => void;
  selectedDuration: DurationOption | null;
  setSelectedDuration: (value: DurationOption | null) => void;
  taskRecorded: boolean;
  startTime: string;
  startAmPm: string;
  setStartAmPm: (v: string) => void;
  endTime: string;
  endAmPm: string;
  setEndAmPm: (v: string) => void;
  durationMode: 'dropdown' | 'manual';
  setDurationMode: (mode: 'dropdown' | 'manual') => void;
  startHour: string;
  setStartHour: (v: string) => void;
  startMinute: string;
  setStartMinute: (v: string) => void;
  endHour: string;
  setEndHour: (v: string) => void;
  endMinute: string;
  setEndMinute: (v: string) => void;
}

export interface MeetingFormProps {
  selectedPerson: OptionType | null;
  setSelectedPerson: (person: OptionType | null) => void;
  selectedProject: OptionType | null;
  setSelectedProject: (project: OptionType | null) => void;
  selectedDuration: Duration | null;
  setSelectedDuration: (duration: Duration | null) => void;
  isTimerRunning?: boolean;
  durationMode: 'dropdown' | 'manual';
  setDurationMode: (mode: 'dropdown' | 'manual') => void;
  startHour: string;
  setStartHour: (v: string) => void;
  startMinute: string;
  setStartMinute: (v: string) => void;
  startAmPm: string;
  setStartAmPm: (v: string) => void;
  endHour: string;
  setEndHour: (v: string) => void;
  endMinute: string;
  setEndMinute: (v: string) => void;
  endAmPm: string;
  setEndAmPm: (v: string) => void;
}

export interface TimePickerProps {
  hour: string;
  onHourChange: (v: string) => void;
  minute: string;
  onMinuteChange: (v: string) => void;
  ampm: string;
  onAmPmChange: (v: string) => void;
  label: string;
  error?: string;
  touched?: boolean;
  onHourBlur?: () => void;
  onMinuteBlur?: () => void;
  onAmPmBlur?: () => void;
}

export interface CreatableSelectFieldProps {
  value: OptionType | null;
  onChange: (value: OptionType | null) => void;
  onCreateOption: (inputValue: string) => void;
  options: OptionType[];
  placeholder: string;
  isClearable?: boolean;
  isSearchable?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export interface TotalTimeDisplayProps {
  todayEntries: EntryType[];
}

export interface EntryProps {
  entry: string;
  onDelete: () => void;
  isDeletable: boolean;
  startTime?: string;
  endTime?: string;
}

export interface HandleAddEntryArgs {
  validateForm: () => boolean;
  selectedDate: Date;
  isTodayFn: (date: Date) => boolean;
  setIsLoading: (v: boolean) => void;
  durationMode: 'dropdown' | 'manual';
  selectedDuration: { value: number; label: string } | null;
  getManualDuration: () => number;
  selectedProject: OptionType | null;
  logType: LogType;
  startHour: string;
  startMinute: string;
  startAmPm: string;
  endHour: string;
  endMinute: string;
  endAmPm: string;
  selectedPerson: OptionType | null;
  todayEntries: EntryType[];
  setTodayEntries: React.Dispatch<React.SetStateAction<EntryType[]>>;
  setTaskRecorded: (v: boolean) => void;
  resetFields: () => void;
}

export interface EntriesListProps {
  entries: EntryType[];
  handleDeleteEntry: (id: string) => void;
  selectedDate: Date;
}

export interface LogTypeSelectorProps {
  logType: LogType;
  setLogType: (type: LogType) => void;
  disabled?: boolean;
}

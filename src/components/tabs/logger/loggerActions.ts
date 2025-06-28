import { toast } from 'sonner';
import { addEntry, handleDeleteEntry } from '../../../utils/entryUtils';
import { format } from 'date-fns';
import { EntryType, OptionType, HandleAddEntryArgs } from '../../../types';
import { formatMinutesToHM } from './loggerUtils';

export async function handleAddEntryAction(args: HandleAddEntryArgs) {
  const {
    validateForm,
    selectedDate,
    isTodayFn,
    setIsLoading,
    durationMode,
    selectedDuration,
    getManualDuration,
    selectedProject,
    logType,
    startHour,
    startMinute,
    startAmPm,
    endHour,
    endMinute,
    endAmPm,
    selectedPerson,
    todayEntries,
    setTodayEntries,
    setTaskRecorded,
    resetFields,
  } = args;
  if (!validateForm()) {
    toast.error('Please fix the validation errors');
    return;
  }
  if (!isTodayFn(selectedDate)) {
    toast.error('You can only add entries for today');
    return;
  }
  setIsLoading(true);
  try {
    let durationLabel = '';
    if (durationMode === 'dropdown') {
      durationLabel =
        selectedDuration?.value != null
          ? formatMinutesToHM(selectedDuration.value)
          : '';
    } else {
      const manualDuration = getManualDuration();
      durationLabel =
        manualDuration > 0 ? formatMinutesToHM(manualDuration) : '';
    }
    let entryText = `Project: ${selectedProject?.label} - ${durationLabel}`;
    if (logType === 'Task' && durationMode === 'manual') {
      const formatTime = (h: string, m: string, ampm: string) => {
        if (!h || !m || !ampm) return '';
        return `${h}:${m} ${ampm}`;
      };
      const formattedStart = formatTime(startHour, startMinute, startAmPm);
      const formattedEnd = formatTime(endHour, endMinute, endAmPm);
      if (formattedStart && formattedEnd) {
        entryText += ` (${formattedStart} - ${formattedEnd})`;
      }
    }
    if (logType === 'Meeting' && selectedPerson) {
      let meetingTime = '';
      const formatTime = (h: string, m: string, ampm: string) => {
        if (!h || !m || !ampm) return '';
        return `${h}:${m} ${ampm}`;
      };
      const formattedStart = formatTime(startHour, startMinute, startAmPm);
      const formattedEnd = formatTime(endHour, endMinute, endAmPm);
      if (formattedStart && formattedEnd) {
        meetingTime = ` (${formattedStart} - ${formattedEnd})`;
      }
      entryText = `Meeting: ${selectedPerson.label} - ${durationLabel}${meetingTime} (Project: ${selectedProject?.label})`;
    }
    const success = await addEntry(
      entryText,
      todayEntries,
      setTodayEntries,
      logType,
      selectedProject?.label,
      durationMode === 'dropdown'
        ? selectedDuration?.value
        : getManualDuration(),
      selectedPerson?.label
    );
    if (success) {
      setTaskRecorded(true);
      resetFields();
      toast.success('Entry added successfully!');
    } else {
      toast.error('Failed to add entry');
    }
  } catch (error) {
    console.error('Error adding entry:', error);
    toast.error('Error adding entry');
  } finally {
    setIsLoading(false);
  }
}

export interface ResetFieldsArgs {
  setSelectedPerson: (v: OptionType | null) => void;
  setSelectedProject: (v: OptionType | null) => void;
  setSelectedDuration: (v: { value: number; label: string } | null) => void;
  setValidationErrors: (v: string[]) => void;
  setStartTime: (v: string) => void;
  setStartAmPm: (v: string) => void;
  setEndTime: (v: string) => void;
  setEndAmPm: (v: string) => void;
  setDurationMode: (v: 'dropdown' | 'manual') => void;
  setStartHour: (v: string) => void;
  setStartMinute: (v: string) => void;
  setEndHour: (v: string) => void;
  setEndMinute: (v: string) => void;
}

export function resetFieldsAction(args: ResetFieldsArgs) {
  const {
    setSelectedPerson,
    setSelectedProject,
    setSelectedDuration,
    setValidationErrors,
    setStartTime,
    setStartAmPm,
    setEndTime,
    setEndAmPm,
    setDurationMode,
    setStartHour,
    setStartMinute,
    setEndHour,
    setEndMinute,
  } = args;
  setSelectedPerson(null);
  setSelectedProject(null);
  setSelectedDuration(null);
  setValidationErrors([]);
  setStartTime('');
  setStartAmPm('AM');
  setEndTime('');
  setEndAmPm('AM');
  setDurationMode('dropdown');
  setStartHour('');
  setStartMinute('');
  setEndHour('');
  setEndMinute('');
}

export async function copyEntriesAction(todayEntries: EntryType[]) {
  try {
    const entriesText = todayEntries
      .map((e) => {
        let timeStr = '';
        if (e.startTime && e.endTime)
          timeStr = `${e.startTime} - ${e.endTime}: `;
        else if (e.startTime) timeStr = `${e.startTime}: `;
        else if (e.endTime) timeStr = `${e.endTime}: `;
        let entryText = e.entry.trim();
        if (
          (e.type === 'Task' || !e.type) &&
          entryText.startsWith('Project:')
        ) {
          entryText = entryText.replace(/^Project:/, 'Task:');
        }
        return `${timeStr}${entryText}`;
      })
      .join('\r\n');
    await navigator.clipboard.writeText(entriesText);
    toast.success('Entries copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy entries:', error);
    toast.error('Failed to copy entries');
  }
}

export function exportEntriesAction(
  todayEntries: EntryType[],
  selectedDate: Date
) {
  try {
    const csvData = todayEntries
      .map((entry) => {
        return `${entry.date},${entry.type || 'Task'},${entry.project || ''},${
          entry.person || ''
        },${entry.duration || 0},${entry.entry}`;
      })
      .join('\n');
    const headers = 'Date,Type,Project,Person,Duration (min),Description\n';
    const fullCSV = headers + csvData;
    const blob = new Blob([fullCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `work-logger-${format(selectedDate, 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Entries exported successfully!');
  } catch (error) {
    console.error('Failed to export entries:', error);
    toast.error('Failed to export entries');
  }
}

export interface HandleDeleteEntryWrapperArgs {
  id: string;
  todayEntries: EntryType[];
  setTodayEntries: React.Dispatch<React.SetStateAction<EntryType[]>>;
  selectedDate: Date;
}

export async function handleDeleteEntryWrapperAction(
  args: HandleDeleteEntryWrapperArgs
) {
  const { id, todayEntries, setTodayEntries, selectedDate } = args;
  try {
    const success = await handleDeleteEntry(
      id,
      todayEntries,
      setTodayEntries,
      selectedDate
    );
    if (success) {
      toast.success('Entry deleted successfully');
    } else {
      toast.error('Failed to delete entry');
    }
  } catch (error) {
    console.error('Failed to delete entry:', error);
    toast.error('Failed to delete entry');
  }
}

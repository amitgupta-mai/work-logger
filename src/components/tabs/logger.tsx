import { useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

import { LogTypeSelector } from '../logTypeSelector';
import { MeetingForm } from '../meetingForm';
import { TaskForm } from '../taskForm';

import { EntryType, LogType } from '../../types';
import { OptionType } from '../../types';
import { getStorageDataAsync } from '../../utils/chromeStorageUtils';
import { loadTheme } from '../../utils/theme';
import { addEntry, handleDeleteEntry } from '../../utils/entryUtils';
import {
  combineValidations,
  validateProject,
  validatePerson,
  validateDuration,
} from '../../utils/validationUtils';
import { EntriesList } from '../entriesList';
import { Button } from '../ui/button';
import { DatePicker } from '../ui/datePicker';
import { CopyIcon, DownloadIcon, AlertCircleIcon } from 'lucide-react';
import { format } from 'date-fns';
import { isToday } from '../../utils/dateTimeUtils';
import TotalTimeDisplay from '../totalTimeDisplay';

const Logger = () => {
  const [logType, setLogType] = useState<LogType>('Task');
  const [selectedProject, setSelectedProject] = useState<OptionType | null>(
    null
  );
  const [selectedDuration, setSelectedDuration] = useState<{
    value: number;
    label: string;
  } | null>(null);
  const [todayEntries, setTodayEntries] = useState<EntryType[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<OptionType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [taskRecorded, setTaskRecorded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [taskElapsedTime, setTaskElapsedTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<string>('');
  const [startAmPm, setStartAmPm] = useState<string>('AM');
  const [endTime, setEndTime] = useState<string>('');
  const [endAmPm, setEndAmPm] = useState<string>('AM');
  const [durationMode, setDurationMode] = useState<'dropdown' | 'manual'>(
    'dropdown'
  );
  const [startHour, setStartHour] = useState('');
  const [startMinute, setStartMinute] = useState('');
  const [endHour, setEndHour] = useState('');
  const [endMinute, setEndMinute] = useState('');

  // hack to record task after if has been done once
  useEffect(() => {
    if (taskRecorded) {
      setTimeout(() => {
        setTaskRecorded(false);
      }, 2000);
    }
  }, [taskRecorded]);

  // Check if timer is running
  useEffect(() => {
    const checkTimerStatus = () => {
      getStorageDataAsync(['isRunning']).then((response) => {
        if (response.success && response.data) {
          setIsTimerRunning(response.data.isRunning || false);
        }
      });
    };

    checkTimerStatus();
    const interval = setInterval(checkTimerStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getStorageDataAsync(['allEntries']);
      if (response.success && response.data) {
        const allEntries =
          (response.data.allEntries as Record<string, EntryType[]>) || {};
        const today = format(selectedDate ?? new Date(), 'yyyy-MM-dd');
        const _todayEntries = allEntries[today] || [];
        setTodayEntries(_todayEntries);
      } else {
        console.error('Failed to load entries:', response.error);
        toast.error('Failed to load entries');
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      toast.error('Error loading entries');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadTheme();
    loadEntries();
  }, [loadEntries]);

  const validateForm = useCallback((): boolean => {
    const validations = [validateProject(selectedProject)];

    if (logType === 'Meeting') {
      validations.push(validatePerson(selectedPerson));
      if (durationMode === 'dropdown') {
        validations.push(validateDuration(selectedDuration?.value || null));
      } else {
        // Manual mode: validate all time fields and duration
        if (
          !startHour ||
          !startMinute ||
          !startAmPm ||
          !endHour ||
          !endMinute ||
          !endAmPm
        ) {
          validations.push({
            isValid: false,
            errors: ['All time fields are required'],
          });
        } else if (getManualDuration() <= 0) {
          validations.push({
            isValid: false,
            errors: ['End time must be after start time'],
          });
        }
      }
    } else if (logType === 'Task') {
      if (durationMode === 'dropdown') {
        validations.push(validateDuration(selectedDuration?.value || null));
      } else {
        // Manual mode: validate all time fields and duration
        if (
          !startHour ||
          !startMinute ||
          !startAmPm ||
          !endHour ||
          !endMinute ||
          !endAmPm
        ) {
          validations.push({
            isValid: false,
            errors: ['All time fields are required'],
          });
        } else if (getManualDuration() <= 0) {
          validations.push({
            isValid: false,
            errors: ['End time must be after start time'],
          });
        }
      }
    }

    const combinedValidation = combineValidations(...validations);
    setValidationErrors(combinedValidation.errors);
    return combinedValidation.isValid;
  }, [
    logType,
    selectedProject,
    selectedDuration,
    selectedPerson,
    durationMode,
    startHour,
    startMinute,
    startAmPm,
    endHour,
    endMinute,
    endAmPm,
  ]);

  const handleAddEntry = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    if (!isToday(selectedDate)) {
      toast.error('You can only add entries for today');
      return;
    }

    setIsLoading(true);
    try {
      let durationLabel = '';
      if (durationMode === 'dropdown') {
        durationLabel = selectedDuration?.label || '';
      } else {
        const manualDuration = getManualDuration();
        durationLabel = manualDuration > 0 ? `${manualDuration} min` : '';
      }
      let entryText = `Project: ${selectedProject?.label} - ${durationLabel}`;
      if (logType === 'Task' && durationMode === 'manual') {
        // Format start and end time as 'hh:mm AM/PM'
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
  };

  const resetFields = () => {
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
  };

  const copyEntries = async () => {
    try {
      const entriesText = todayEntries
        .map((e) => {
          let timeStr = '';
          if (e.startTime && e.endTime)
            timeStr = `${e.startTime} - ${e.endTime}: `;
          else if (e.startTime) timeStr = `${e.startTime}: `;
          else if (e.endTime) timeStr = `${e.endTime}: `;
          return `${timeStr}${e.entry.trim()}`;
        })
        .join('\r\n');
      console.log('entriesText:', JSON.stringify(entriesText));
      await navigator.clipboard.writeText(entriesText);
      toast.success('Entries copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy entries:', error);
      toast.error('Failed to copy entries');
    }
  };

  const exportEntries = () => {
    try {
      const csvData = todayEntries
        .map((entry) => {
          return `${entry.date},${entry.type || 'Task'},${
            entry.project || ''
          },${entry.person || ''},${entry.duration || 0},${entry.entry}`;
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
  };

  // Helper to calculate duration in manual mode
  const getManualDuration = () => {
    if (
      !startHour ||
      !startMinute ||
      !endHour ||
      !endMinute ||
      !startAmPm ||
      !endAmPm
    )
      return 0;
    let sh = parseInt(startHour, 10);
    let eh = parseInt(endHour, 10);
    const sm = parseInt(startMinute, 10);
    const em = parseInt(endMinute, 10);
    if (isNaN(sh) || isNaN(eh) || isNaN(sm) || isNaN(em)) return 0;
    // Convert to 24-hour time
    const origSh = sh,
      origEh = eh;
    const origStartAmPm = startAmPm,
      origEndAmPm = endAmPm;
    if (startAmPm === 'PM' && sh !== 12) sh += 12;
    if (startAmPm === 'AM' && sh === 12) sh = 0;
    if (endAmPm === 'PM' && eh !== 12) eh += 12;
    if (endAmPm === 'AM' && eh === 12) eh = 0;
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    console.log('getManualDuration:', {
      startHour,
      startMinute,
      startAmPm,
      endHour,
      endMinute,
      endAmPm,
      origSh,
      origEh,
      origStartAmPm,
      origEndAmPm,
      sh,
      eh,
      sm,
      em,
      start,
      end,
      duration: end > start ? end - start : 0,
    });
    return end > start ? end - start : 0;
  };

  const isAddEntryDisabled = useMemo(() => {
    if (isLoading) return true;
    if (logType === 'Meeting') {
      if (durationMode === 'dropdown') {
        return !selectedPerson || !selectedProject || !selectedDuration;
      } else {
        // manual mode: require all start/end fields and valid duration
        return (
          !selectedPerson ||
          !selectedProject ||
          !startHour ||
          !startMinute ||
          !startAmPm ||
          !endHour ||
          !endMinute ||
          !endAmPm ||
          getManualDuration() <= 0
        );
      }
    }
    if (logType === 'Task') {
      if (durationMode === 'dropdown') {
        return !selectedProject || !selectedDuration;
      } else {
        // manual mode: require all start/end fields and valid duration
        return (
          !selectedProject ||
          !startHour ||
          !startMinute ||
          !startAmPm ||
          !endHour ||
          !endMinute ||
          !endAmPm ||
          getManualDuration() <= 0
        );
      }
    }
    return false;
  }, [
    logType,
    selectedPerson,
    selectedProject,
    selectedDuration,
    isLoading,
    durationMode,
    startHour,
    startMinute,
    startAmPm,
    endHour,
    endMinute,
    endAmPm,
  ]);

  // Remove immediateDurationError and instead show a toast when the error condition is met
  useEffect(() => {
    if (
      durationMode === 'manual' &&
      startHour &&
      startMinute &&
      startAmPm &&
      endHour &&
      endMinute &&
      endAmPm &&
      getManualDuration() <= 0
    ) {
      toast.error('End time must be after start time');
    }
  }, [
    durationMode,
    startHour,
    startMinute,
    startAmPm,
    endHour,
    endMinute,
    endAmPm,
  ]);

  const handleDeleteEntryWrapper = async (id: string) => {
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
  };

  return (
    <div className='h-full flex flex-col gap-2'>
      <div className='flex-shrink-0 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col max-h-[250px]'>
        <div className='p-2 space-y-1.5 flex-1 overflow-y-auto hide-scrollbar-on-idle pb-0'>
          <div className='flex justify-between items-center'>
            <LogTypeSelector
              logType={logType}
              setLogType={setLogType}
              disabled={isTimerRunning || taskElapsedTime > 0}
            />
            <TotalTimeDisplay todayEntries={todayEntries} />
          </div>
          {logType === 'Task' ? (
            <TaskForm
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              selectedDuration={selectedDuration}
              setSelectedDuration={setSelectedDuration}
              taskRecorded={taskRecorded}
              onElapsedTimeChange={setTaskElapsedTime}
              startTime={startTime}
              startAmPm={startAmPm}
              endTime={endTime}
              endAmPm={endAmPm}
              durationMode={durationMode}
              setDurationMode={setDurationMode}
              startHour={startHour}
              setStartHour={setStartHour}
              startMinute={startMinute}
              setStartMinute={setStartMinute}
              endHour={endHour}
              setEndHour={setEndHour}
              endMinute={endMinute}
              setEndMinute={setEndMinute}
            />
          ) : (
            <MeetingForm
              selectedPerson={selectedPerson}
              setSelectedPerson={setSelectedPerson}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              selectedDuration={selectedDuration}
              setSelectedDuration={setSelectedDuration}
              isTimerRunning={isTimerRunning}
              durationMode={durationMode}
              setDurationMode={setDurationMode}
              startHour={startHour}
              setStartHour={setStartHour}
              startMinute={startMinute}
              setStartMinute={setStartMinute}
              startAmPm={startAmPm}
              setStartAmPm={setStartAmPm}
              endHour={endHour}
              setEndHour={setEndHour}
              endMinute={endMinute}
              setEndMinute={setEndMinute}
              endAmPm={endAmPm}
              setEndAmPm={setEndAmPm}
            />
          )}
          {validationErrors.length > 0 && (
            <div className='text-destructive text-sm p-2 rounded-md bg-destructive/10'>
              <ul className='space-y-1'>
                {validationErrors.map((error, index) => (
                  <li key={index} className='flex items-center gap-2'>
                    <AlertCircleIcon className='size-4' />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className='sticky bottom-0 left-0 w-full bg-card py-2 z-10'>
            <Button
              onClick={handleAddEntry}
              disabled={isAddEntryDisabled}
              className='w-full'
            >
              {isLoading ? 'Adding...' : 'Add Entry'}
            </Button>
          </div>
        </div>
      </div>

      <div className='flex-1 flex flex-col min-h-0 rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden'>
        <div className='px-3 py-0 border-b'>
          <div className='flex items-center gap-2 py-1'>
            <h2 className='text-base font-semibold whitespace-nowrap'>
              Logs for:
            </h2>
            <DatePicker
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </div>
        </div>
        <div className='flex-1 overflow-y-auto hide-scrollbar-on-idle px-3 pt-1 pb-3 min-h-0'>
          <EntriesList
            entries={todayEntries}
            handleDeleteEntry={handleDeleteEntryWrapper}
            selectedDate={selectedDate}
          />
        </div>
        <div className='flex-shrink-0 px-3 py-2 border-t bg-background'>
          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={copyEntries}
              disabled={todayEntries.length === 0}
            >
              <CopyIcon className='mr-2 size-4' />
              Copy
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={exportEntries}
              disabled={todayEntries.length === 0}
            >
              <DownloadIcon className='mr-2 size-4' />
              Export CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logger;

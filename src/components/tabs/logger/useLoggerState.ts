import { useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { EntryType, LogType } from '../../../types';
import { OptionType } from '../../../types';
import { getStorageDataAsync } from '../../../utils/chromeStorageUtils';
import { loadTheme } from '../../../utils/theme';
import { format } from 'date-fns';
import { isToday } from '../../../utils/dateTimeUtils';
import { getManualDuration } from './loggerUtils';
import { validateLoggerForm } from './loggerValidation';
import {
  handleAddEntryAction,
  copyEntriesAction,
  exportEntriesAction,
  handleDeleteEntryWrapperAction,
  resetFieldsAction,
} from './loggerActions';

export function useLoggerState() {
  // --- STATE ---
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

  // --- EFFECTS ---
  useEffect(() => {
    if (taskRecorded) {
      setTimeout(() => {
        setTaskRecorded(false);
      }, 2000);
    }
  }, [taskRecorded]);

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

  // --- VALIDATION & UTILS ---
  const manualDuration = () =>
    getManualDuration({
      startHour,
      startMinute,
      endHour,
      endMinute,
      startAmPm,
      endAmPm,
    });

  const validateForm = useCallback((): boolean => {
    const result = validateLoggerForm({
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
      getManualDuration: manualDuration,
    });
    setValidationErrors(result.errors);
    return result.isValid;
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

  // --- ACTIONS ---
  const handleAddEntry = async () => {
    await handleAddEntryAction({
      validateForm,
      selectedDate,
      isTodayFn: isToday,
      setIsLoading,
      durationMode,
      selectedDuration,
      getManualDuration: manualDuration,
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
      resetFields: () => resetFields(),
    });
  };

  const resetFields = () => {
    resetFieldsAction({
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
    });
  };

  const copyEntries = async () => {
    await copyEntriesAction(todayEntries);
  };

  const exportEntries = () => {
    exportEntriesAction(todayEntries, selectedDate);
  };

  const handleDeleteEntryWrapper = async (id: string) => {
    await handleDeleteEntryWrapperAction({
      id,
      todayEntries,
      setTodayEntries,
      selectedDate,
    });
  };

  useEffect(() => {
    if (
      durationMode === 'manual' &&
      startHour &&
      startMinute &&
      startAmPm &&
      endHour &&
      endMinute &&
      endAmPm &&
      getManualDuration({
        startHour,
        startMinute,
        endHour,
        endMinute,
        startAmPm,
        endAmPm,
      }) <= 0
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

  const isAddEntryDisabled = useMemo(() => {
    if (isLoading) return true;
    if (logType === 'Meeting') {
      if (durationMode === 'dropdown') {
        return !selectedPerson || !selectedProject || !selectedDuration;
      } else {
        return (
          !selectedPerson ||
          !selectedProject ||
          !startHour ||
          !startMinute ||
          !startAmPm ||
          !endHour ||
          !endMinute ||
          !endAmPm ||
          getManualDuration({
            startHour,
            startMinute,
            endHour,
            endMinute,
            startAmPm,
            endAmPm,
          }) <= 0
        );
      }
    }
    if (logType === 'Task') {
      if (durationMode === 'dropdown') {
        return !selectedProject || !selectedDuration;
      } else {
        return (
          !selectedProject ||
          !startHour ||
          !startMinute ||
          !startAmPm ||
          !endHour ||
          !endMinute ||
          !endAmPm ||
          getManualDuration({
            startHour,
            startMinute,
            endHour,
            endMinute,
            startAmPm,
            endAmPm,
          }) <= 0
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

  return {
    logType,
    setLogType,
    selectedProject,
    setSelectedProject,
    selectedDuration,
    setSelectedDuration,
    todayEntries,
    setTodayEntries,
    selectedPerson,
    setSelectedPerson,
    selectedDate,
    setSelectedDate,
    taskRecorded,
    setTaskRecorded,
    isLoading,
    setIsLoading,
    validationErrors,
    setValidationErrors,
    isTimerRunning,
    setIsTimerRunning,
    taskElapsedTime,
    setTaskElapsedTime,
    startTime,
    setStartTime,
    startAmPm,
    setStartAmPm,
    endTime,
    setEndTime,
    endAmPm,
    setEndAmPm,
    durationMode,
    setDurationMode,
    startHour,
    setStartHour,
    startMinute,
    setStartMinute,
    endHour,
    setEndHour,
    endMinute,
    setEndMinute,
    validateForm,
    handleAddEntry,
    resetFields,
    copyEntries,
    exportEntries,
    manualDuration,
    isAddEntryDisabled,
    handleDeleteEntryWrapper,
  };
}
